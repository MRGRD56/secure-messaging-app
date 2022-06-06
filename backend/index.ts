import * as express from 'express';
import MessageIn from '@secure-messaging-app/common/types/MessageIn';
import {isEmpty, isString} from 'lodash';
import GetNewMessagesParams from '@secure-messaging-app/common/types/GetNewMessagesParams';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import * as moment from 'moment';
import Client from '@secure-messaging-app/common/types/Client';
import * as cors from 'cors';
import {v4} from 'uuid';
import * as events from 'events';
import * as rxjs from 'rxjs';
import {Subject} from 'rxjs';
import * as net from 'net';

const GET_MESSAGES_TIMEOUT = 25_000; //ms
const PORT = 9021;

events.EventEmitter.defaultMaxListeners = 50;

const app = express();
app.use(express.json());
app.use(cors());

interface BackendState {
    clients: Record<string, Client>;
    newMessage$: Subject<MessageOut[]>;
}

const state: BackendState = {
    clients: {},
    newMessage$: new Subject<MessageOut[]>()
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

    state.newMessage$.next([message]);
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

    getNewMessages(body, req.socket).then(newMessages => {
        res.status(200).send(newMessages);
    });
});

const getNewMessages =
    async (params: GetNewMessagesParams, socket: net.Socket): Promise<MessageOut[]> =>
        new Promise(resolve => {
            const {keyHash, clientId} = params;

            const newMessageSubscription = state.newMessage$
                .pipe(
                    rxjs.map(messages => messages.filter(message => {
                        return message.keyHash === keyHash && message.clientId !== clientId;
                    })),
                    rxjs.filter(messages => Boolean(messages) && messages.length > 0)
                )
                .subscribe(resolve);

            const timeout = setTimeout(() => {
                cancel();
            }, GET_MESSAGES_TIMEOUT);

            const cancel = () => {
                newMessageSubscription.unsubscribe();
                resolve([]);
                clearTimeout(timeout);
            };

            const closeHandler = () => {
                socket.off('close', closeHandler);
                cancel();
            };
            socket.on('close', closeHandler);
        });

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
