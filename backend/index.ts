import * as express from 'express';
import * as moment from 'moment';
import * as cors from 'cors';
import {v4} from 'uuid';
import * as events from 'events';
import * as rxjs from 'rxjs';
import {Subject} from 'rxjs';
import * as net from 'net';
import Client from './common/types/Client';
import MessageOut from './common/types/MessageOut';
import TypingOut from './common/types/TypingOut';
import MessageIn from './common/types/MessageIn';
import GetNewUpdatesParams from './common/types/GetNewUpdatesParams';
import UpdateOut from './common/types/UpdateOut';
import TypingIn from './common/types/TypingIn';
import validateBaseIn from './utils/validateBaseIn';
import isNonEmptyString from './utils/isNonEmptyString';

const GET_MESSAGES_TIMEOUT = 25_000; //ms
const PORT = 9021;

events.EventEmitter.defaultMaxListeners = 0;

const app = express();
app.use(express.json());
app.use(cors());

interface BackendState {
    clients: Record<string, Client>;
    newUpdate$: Subject<UpdateOut[]>;
}

const state: BackendState = {
    clients: {},
    newUpdate$: new Subject<UpdateOut[]>()
};

app.post('/api/message/send', (req, res) => {
    const body = req.body as MessageIn;

    if (!validateBaseIn(body)
        || !isNonEmptyString(body.encryptedText)) {
        res.status(400).send('Invalid request body');
        return;
    }

    if (!validateClientId(body.clientId, req.ip)) {
        res.status(403).send('This clientId is already used by another client');
        return;
    }

    const message: MessageOut = {
        type: 'message',
        clientId: body.clientId,
        encryptedText: body.encryptedText,
        chatId: body.chatId,
        date: moment().format(),
        id: v4()
    };

    state.newUpdate$.next([message]);
    res.sendStatus(200);
});

app.post('/api/message/typing', (req, res) => {
    const body = req.body as TypingIn;

    if (!validateBaseIn(body)) {
        res.status(400).send('Invalid request body');
        return;
    }

    if (!validateClientId(body.clientId, req.ip)) {
        res.status(403).send('This clientId is already used by another client');
        return;
    }

    const typing: TypingOut = {
        type: 'typing',
        clientId: body.clientId,
        chatId: body.chatId,
        date: moment().format()
    };

    state.newUpdate$.next([typing]);
    res.sendStatus(200);
});

app.post('/api/message/get-new', (req, res) => {
    const body = req.body as GetNewUpdatesParams;

    if (!validateBaseIn(body)) {
        res.status(400).send('Invalid request body');
        return;
    }

    if (!validateClientId(body.clientId, req.ip)) {
        res.status(403).send('This clientId is already used by another client');
        return;
    }

    getNewUpdates(body, req.socket).then(updates => {
        res.status(200).send(updates);
    });
});

const getNewUpdates =
    async (params: GetNewUpdatesParams, socket: net.Socket): Promise<UpdateOut[]> =>
        new Promise(resolve => {
            const {chatId, clientId} = params;

            const newMessageSubscription = state.newUpdate$
                .pipe(
                    rxjs.map(messages => messages.filter(message => {
                        return message.chatId === chatId && message.clientId !== clientId;
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
