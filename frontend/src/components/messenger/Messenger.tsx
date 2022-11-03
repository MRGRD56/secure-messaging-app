import React, {FunctionComponent, HTMLProps, useEffect, useRef, useState} from 'react';
import styles from './Messenger.module.scss';
import Messages from '../messages/Messages';
import useAutoRef from '../../hooks/useAutoRef';
import sendMessage from '../../actions/api/sendMessage';
import moment from 'moment';
import getNewMessages from '../../actions/api/getNewMessages';
import MessageInput from '../messageInput/MessageInput';
import classNames from 'classnames';
import {useDidMount, useLocalstorageState, useSessionstorageState} from 'rooks';
import {v4} from 'uuid';
import axios from 'axios';
import useQueryParams from '../../hooks/useQueryParams';
import {isString} from 'lodash';
import {Base64} from 'js-base64';
import TopPanel from '../topPanel/TopPanel';
import MessageOut from '../../common/types/MessageOut';
import MessageIn from '../../common/types/MessageIn';
import getSwRegistration from '../../utils/getSwRegistration';

interface Props extends HTMLProps<HTMLDivElement> {
}

const Messenger: FunctionComponent<Props> = ({className, ...props}) => {
    const {kb: querySecretKeyBase64, k: querySecretKeyText} = useQueryParams();

    const [messages, setMessages] = useState<MessageOut[]>([]);
    const [manualSecretKey, setManualSecretKey] = useLocalstorageState<string>('secure-messaging-app:secretKey', '');
    const [urlSecretKey, setUrlSecretKey] = useState<string>();
    const [clientId, setClientId] = useSessionstorageState<string>('secure-messaging-app:clientId', v4());
    const [newMessage, setNewMessage] = useState<string>('');

    const actualSecretKey = urlSecretKey || manualSecretKey;

    const requestParamsRef = useAutoRef({actualSecretKey});
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const newMessageRequestAbortControllerRef = useRef<AbortController>();
    const newMessageRequestAbortTimeoutRef = useRef<number>();
    const canChangeSecretKey = useRef<boolean>(false);

    useDidMount(() => {
        Notification?.requestPermission();

        const isQuerySecretKeyTextUsed = isString(querySecretKeyText) && querySecretKeyText.length > 0;
        const isQuerySecretKeyBase64Used = isString(querySecretKeyBase64) && querySecretKeyBase64.length > 0;

        if (isQuerySecretKeyTextUsed === isQuerySecretKeyBase64Used) {
            return;
        }

        if (isQuerySecretKeyTextUsed) {
            setUrlSecretKey(querySecretKeyText);
        } else if (isQuerySecretKeyBase64Used) {
            setUrlSecretKey(Base64.decode(querySecretKeyBase64));
        }
    });

    useDidMount(() => {
        if (!clientId) {
            setClientId(v4());
        }
    });

    const handleSend = async () => {
        if (!newMessage.length) {
            return;
        }

        const secretKey = actualSecretKey;

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

    const showNotification = (newMessages: MessageOut[]) => {
        if (document.hidden) {
            getSwRegistration().then(registration => {
                registration.showNotification('New message', {
                    body: newMessages.map(message => message.encryptedText).join('\n\n'),
                    silent: false,
                    vibrate: [400, 200, 400]
                });
            });
        }
    };

    const handleNewMessages = (newMessages: MessageOut[]) => {
        showNotification(newMessages);

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
                    const secretKey = requestParamsRef.current.actualSecretKey;

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
                        handleNewMessages(newMessages);
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
        if (!canChangeSecretKey.current) {
            canChangeSecretKey.current = true;
            return;
        }

        if (newMessageRequestAbortTimeoutRef.current !== undefined) {
            window.clearTimeout(newMessageRequestAbortTimeoutRef.current);
        }
        newMessageRequestAbortTimeoutRef.current = window.setTimeout(() => {
            newMessageRequestAbortControllerRef.current?.abort();
        }, 1000);
    }, [actualSecretKey]);

    return (
        <div className={classNames(styles.container, className)} {...props}>
            {!urlSecretKey && (
                <TopPanel secretKey={manualSecretKey} onSecretKeyChange={setManualSecretKey}/>
            )}
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                <Messages className={styles.messages} messages={messages} clientId={clientId}/>
            </div>
            <div className={styles.inputContainer}>
                <MessageInput className={styles.messageInput}
                              value={newMessage}
                              onTextChange={setNewMessage}
                              onSend={handleSend}
                              secretKey={actualSecretKey}/>
            </div>
        </div>
    );
};

export default Messenger;
