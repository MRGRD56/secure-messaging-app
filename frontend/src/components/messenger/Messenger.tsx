import React, {FunctionComponent, HTMLProps, useEffect, useRef, useState} from 'react';
import styles from './Messenger.module.scss';
import Messages from '../messages/Messages';
import useAutoRef from '../../hooks/useAutoRef';
import sendMessage from '../../actions/api/sendMessage';
import moment from 'moment';
import getNewUpdates from '../../actions/api/getNewUpdates';
import MessageInput from '../messageInput/MessageInput';
import classNames from 'classnames';
import {useDebounce, useDidMount, useLocalstorageState, useThrottle} from 'rooks';
import {v4} from 'uuid';
import axios from 'axios';
import useQueryParams from '../../hooks/useQueryParams';
import {isString, omit} from 'lodash';
import {Base64} from 'js-base64';
import TopPanel from '../topPanel/TopPanel';
import MessageOut from '../../common/types/MessageOut';
import MessageIn from '../../common/types/MessageIn';
import getSwRegistration from '../../utils/getSwRegistration';
import TypingOut from '../../common/types/TypingOut';
import sendTyping from '../../actions/api/sendTyping';
import sha256 from '../../utils/sha256';
import Gravatar from 'react-gravatar';
import typingIcon from '../../assets/typing_6.gif';

interface TypingClient {
    clientId: string;
    cancellationId: number;
}

interface Props extends HTMLProps<HTMLDivElement> {
}

const Messenger: FunctionComponent<Props> = ({className, ...props}) => {
    const {kb: querySecretKeyBase64, k: querySecretKeyText} = useQueryParams();

    const [messages, setMessages] = useState<MessageOut[]>([]);
    const [typingClients, setTypingClients] = useState<Record<string, TypingClient>>({});

    const [manualSecretKey, setManualSecretKey] = useLocalstorageState<string>('secure-messaging-app:secretKey', '');
    const [urlSecretKey, setUrlSecretKey] = useState<string>();
    const [clientId, setClientId] = useLocalstorageState<string>('secure-messaging-app:clientId', v4());
    const [newMessage, setNewMessage] = useState<string>('');

    const actualSecretKey = urlSecretKey || manualSecretKey;
    const chatId = sha256(actualSecretKey);

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

        const sentMessage: MessageIn = {
            clientId,
            chatId,
            encryptedText: newMessage
        };

        sendMessage(sentMessage, actualSecretKey);

        setMessages(messages => [
            ...messages,
            {
                ...sentMessage,
                type: 'message',
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

    const [handleTypingDebounced] = useThrottle(sendTyping, 2000);
    const handleTyping = () => {
        handleTypingDebounced({chatId, clientId});
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
        stopClientTypings(newMessages.map(({clientId}) => clientId));
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

    const stopClientTypings = (clientIds?: string[]): void => {
        const clientIdsSet = clientIds && new Set(clientIds);

        setTypingClients(currentTypingClients => {
            return Object.entries(currentTypingClients).reduce((result, typingClient) => {
                if (clientIdsSet && !clientIdsSet.has(typingClient[0])) {
                    result[typingClient[0]] = typingClient[1];
                    return result;
                }

                window.clearTimeout(typingClient[1].cancellationId);
                return result;
            }, {} as Record<string, TypingClient>);
        });
    };

    const handleNewTypings = (newTypings: TypingOut[]) => {
        setTypingClients(currentTypingClients => {
            return {
                ...currentTypingClients,
                ...newTypings.reduce((result, typing) => {
                    const alreadyTypingClient = currentTypingClients[typing.clientId];

                    if (alreadyTypingClient) {
                        window.clearTimeout(alreadyTypingClient.cancellationId);
                    }

                    const cancellationId = window.setTimeout(() => {
                        setTypingClients(clients => {
                            return omit(clients, [typing.clientId]);
                        });
                    }, 3000);

                    result[typing.clientId] = {
                        clientId: typing.clientId,
                        cancellationId
                    };

                    return result;
                }, {} as Record<string, TypingClient>)
            };
        });
    };

    useDidMount(() => {
        (async () => {
            while (true) {
                try {
                    const secretKey = requestParamsRef.current.actualSecretKey;

                    const abortController = new AbortController();
                    newMessageRequestAbortControllerRef.current = abortController;
                    const newUpdates = await getNewUpdates({
                        clientId,
                        chatId: secretKey
                    }, secretKey, abortController.signal);

                    const newMessages = newUpdates.filter(({type}) => type === 'message') as MessageOut[];

                    setMessages(messages => [
                        ...messages,
                        ...newMessages
                    ]);

                    if (newMessages.length > 0) {
                        handleNewMessages(newMessages);
                    }

                    const newTypings = newUpdates.filter(({type}) => type === 'typing') as TypingOut[];

                    if (newTypings.length > 0) {
                        handleNewTypings(newTypings);
                    }
                } catch (error) {
                    if (axios.isCancel(error)) {
                        continue;
                    }

                    if (axios.isAxiosError(error)) {
                        if (error.response?.data === 'CLIENT_ID_ALREADY_USED') {
                            setClientId(v4());
                            continue;
                        }
                    }

                    throw error;
                }
            }
        })();
    });

    useEffect(() => {
        if (!canChangeSecretKey.current) {
            canChangeSecretKey.current = true;
            return;
        }

        stopClientTypings();
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
            <div className={styles.typingContainer}>
                {Object.keys(typingClients).length > 0 && (
                    <>
                        {Object.values(typingClients).map((typing, index) => (
                            <div key={index} className={styles.typingClient}>
                                <Gravatar email={typing.clientId} className={styles.typingAvatar}/>
                            </div>
                        ))}
                        <div className={styles.typingText}>
                            {'  '}{Object.keys(typingClients).length === 1 ? 'is' : 'are'} typing
                            <img src={typingIcon} alt="..." className={styles.typingIcon}/>
                        </div>
                    </>
                )}
            </div>
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                <Messages className={styles.messages} messages={messages} clientId={clientId}/>
            </div>
            <div className={styles.inputContainer}>
                <MessageInput className={styles.messageInput}
                              value={newMessage}
                              onTextChange={setNewMessage}
                              onSend={handleSend}
                              secretKey={actualSecretKey}
                              onInput={handleTyping}
                />
            </div>
        </div>
    );
};

export default Messenger;
