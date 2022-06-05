import * as express from 'express';
import MessageIn from '@secure-messaging-app/common/types/MessageIn';
import {isEmpty, isString} from 'lodash';
import GetNewMessagesParams from '@secure-messaging-app/common/types/GetNewMessagesParams';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import * as moment from 'moment';
import {Moment} from 'moment';
import delay from '@secure-messaging-app/common/utils/delay';
import Client from '@secure-messaging-app/common/types/Client';
import * as cors from 'cors';
import CancellationToken from './types/CancellationToken';
import {v4} from 'uuid';
import * as events from 'events';

const GET_MESSAGES_TIMEOUT = 25_000; //ms
const PORT = 9021;
const IS_TWO_PERSON_MODE = false;

events.EventEmitter.defaultMaxListeners = 50;

const app = express();
app.use(express.json());
app.use(cors());

interface BackendState {
    messages: MessageOut[];
    clients: Record<string, Client>;
    //client id -> message ids
    receivedMessages: Record<string, string[]>;
    //FIXME: пользователь может получить список всех сообщений для выбранного keyHash
    // при этом отправитель не получит эти сообщения
    // ожидаемое поведение: никто не получает список этих сообщений
    // возможно отправлять сообщения только тем кто в момент отправки сообщения пытается получить новые сообщения?
}

const state: BackendState = {
    messages: [],
    clients: {},
    receivedMessages: {}
};

app.post('/api/message/send', (req, res) => {
    const body = req.body as MessageIn;

    if (!isString(body.clientId)
        || isEmpty(body.clientId)
        || !isString(body.keyHash)
        || isEmpty(body.keyHash)
        || !isString(body.encryptedText)
        || isEmpty(body.encryptedText)) {
        res.status(400).send('Invalid request body');
        return;
    }

    if (!validateClientId(body.clientId, req.ip)) {
        res.status(403).send('This clientId is already used by another client');
        return;
    }

    const message: MessageOut = {
        clientId: body.clientId,
        encryptedText: body.encryptedText,
        keyHash: body.keyHash,
        date: moment().format(),
        id: v4()
    };

    state.messages.push(message);
    res.sendStatus(200);
});

app.post('/api/message/get-new', (req, res) => {
    const body = req.body as GetNewMessagesParams;

    if (!isString(body.keyHash)
        || isEmpty(body.keyHash)
        || !isString(body.clientId)
        || isEmpty(body.clientId)) {
        res.status(400).send('Invalid request body');
        return;
    }

    if (!validateClientId(body.clientId, req.ip)) {
        res.status(403).send('This clientId is already used by another client');
        return;
    }

    const cancellationToken = new CancellationToken();

    const closeHandler = () => {
        cancellationToken.cancel();
        req.socket.off('close', closeHandler);
    };

    req.socket.on('close', closeHandler);

    getNewMessages(body, cancellationToken).then(newMessages => {
        // console.log(`RETURN to clientId=${body.clientId}`, {newMessages})
        res.status(200).send(newMessages);
    });
});

const getNewMessages = async (params: GetNewMessagesParams, cancellationToken: CancellationToken, initialTimestamp: Moment = moment()): Promise<MessageOut[]> => {
    const {messages} = state;
    const {keyHash, clientId} = params;

    const newMessages: MessageOut[] = [];

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.keyHash !== keyHash || message.clientId === clientId || checkIfMessageReceived(clientId, message.id)) {
            continue;
        }

        newMessages.push(message);
        // messages.splice(i, 1);
        addReceivedMessage(clientId, message.id, i);
    }

    if (!cancellationToken.isCancelled && !newMessages.length && moment().diff(initialTimestamp, 'ms') < GET_MESSAGES_TIMEOUT) {
        await delay(100);
        return await getNewMessages(params, cancellationToken, initialTimestamp);
    }

    return newMessages;
};

const checkIfMessageReceived = (clientId: string, messageId: string): boolean => {
    if (IS_TWO_PERSON_MODE) {
        return;
    }

    const {receivedMessages} = state;

    return receivedMessages[clientId]?.includes(messageId);
}

const addReceivedMessage = (clientId: string, messageId: string, messageIndex: number): boolean => {
    if (IS_TWO_PERSON_MODE) {
        state.messages.splice(messageIndex, 1);
        return;
    }

    const {receivedMessages} = state;

    if (receivedMessages[clientId] === undefined) {
        receivedMessages[clientId] = [messageId];
        return;
    }

    receivedMessages[clientId].push(messageId);
}

const validateClientId = (clientId: string, ip: string): boolean => {
    const {clients} = state;

    const existingClient: Client | undefined = clients[clientId];

    if (existingClient !== undefined && existingClient.ipAddress !== ip) {
        return false;
    }

    if (existingClient === undefined) {
        clients[clientId] = {ipAddress: ip};
    }

    return true;
};

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
