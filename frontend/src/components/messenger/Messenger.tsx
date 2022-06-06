import React, {FunctionComponent, HTMLProps, useEffect, useRef, useState} from 'react';
import styles from './Messenger.module.scss';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import Messages from '../messages/Messages';
import useAutoRef from '../../hooks/useAutoRef';
import MessageIn from '@secure-messaging-app/common/types/MessageIn';
import sendMessage from '../../actions/api/sendMessage';
import moment from 'moment';
import getNewMessages from '../../actions/api/getNewMessages';
import MessageInput from '../messageInput/MessageInput';
import classNames from 'classnames';
import {useDidMount, useLocalstorageState, useSessionstorageState} from 'rooks';
import {TextField} from '@mui/material';
import {v4} from 'uuid';
import axios from 'axios';

interface Props extends HTMLProps<HTMLDivElement> {
}

const Messenger: FunctionComponent<Props> = ({className, ...props}) => {
    const [messages, setMessages] = useState<MessageOut[]>([]);
    const [secretKey, setSecretKey] = useLocalstorageState<string>('secure-messaging-app:secretKey', '');
    const [clientId, setClientId] = useSessionstorageState<string>('secure-messaging-app:clientId', v4());

    const [newMessage, setNewMessage] = useState<string>('');

    const requestParamsRef = useAutoRef({secretKey});
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const newMessageRequestAbortControllerRef = useRef<AbortController>();
    const newMessageRequestAbortTimeoutRef = useRef<number>();

    useDidMount(() => {
        if (!clientId) {
            setClientId(v4());
        }
    });

    const handleSend = async () => {
        if (!newMessage.length) {
            return;
        }

        const sentMessage: MessageIn = {
            clientId,
            keyHash: secretKey,
            encryptedText: newMessage
        };

        sendMessage(sentMessage, secretKey);

        setMessages(messages => [
            ...messages,
            {
                ...sentMessage,
                date: moment().format(),
                id: 'unknown'
            }
        ]);

        setNewMessage('');

        setTimeout(() => {
            const messagesContainer = messagesContainerRef.current;
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 0);
    };

    const handleNewMessages = () => {
        const messagesDiv = messagesContainerRef.current;
        if (!messagesDiv) {
            return;
        }

        if (messagesDiv && messagesDiv.scrollHeight - messagesDiv.offsetHeight - messagesDiv.scrollTop < 20) {
            setTimeout(() => {
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }, 0);
        }
    };

    useDidMount(() => {
        (async () => {
            while (true) {
                try {
                    const {secretKey} = requestParamsRef.current;

                    const abortController = new AbortController();
                    newMessageRequestAbortControllerRef.current = abortController;
                    const newMessages = await getNewMessages({
                        clientId,
                        keyHash: secretKey
                    }, secretKey, abortController.signal);

                    setMessages(messages => [
                        ...messages,
                        ...newMessages
                    ]);

                    if (newMessages.length > 0) {
                        handleNewMessages();
                    }
                } catch (error) {
                    if (!axios.isCancel(error)) {
                        throw error;
                    }
                }
            }
        })();
    });

    useEffect(() => {
        if (newMessageRequestAbortTimeoutRef.current !== undefined) {
            window.clearTimeout(newMessageRequestAbortTimeoutRef.current);
        }
        newMessageRequestAbortTimeoutRef.current = window.setTimeout(() => {
            newMessageRequestAbortControllerRef.current?.abort();
        }, 1000);
    }, [secretKey]);

    return (
        <div className={classNames(styles.container, className)} {...props}>
            <div className={styles.topBar}>
                {/*<Typography variant="h6" component="div" sx={{flexGrow: 1}}>*/}
                {/*    Secure Messenger*/}
                {/*</Typography>*/}
                <TextField className={styles.secretKeyInput} label="Secret key" variant="standard" type="password"
                           value={secretKey} onChange={e => setSecretKey(e.target.value)}/>
            </div>
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                <Messages className={styles.messages} messages={messages} clientId={clientId}/>
            </div>
            <div className={styles.inputContainer}>
                <MessageInput className={styles.messageInput} value={newMessage} onTextChange={setNewMessage} onSend={handleSend}/>
            </div>
        </div>
    );
};

export default Messenger;
