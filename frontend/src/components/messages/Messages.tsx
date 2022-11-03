import React, {FunctionComponent} from 'react';
import styles from './Messages.module.scss';
import Message from '../message/Message';
import classNames from 'classnames';
import {Typography} from '@mui/material';
import MessageOut from '../../common/types/MessageOut';
import Gravatar from 'react-gravatar';

interface Props {
    messages: MessageOut[];
    clientId: string;
    className?: string;
}

const Messages: FunctionComponent<Props> = ({clientId, messages, className}) => {
    return (
        <div className={classNames(styles.container, className)}>
            {messages.length > 0 ? (
                messages.map((message, index) => {
                    const nextMessage: MessageOut | undefined = messages[index + 1];

                    const isMyMessage = clientId === message.clientId;

                    const hasNextMessageIndent = nextMessage !== undefined && nextMessage.clientId !== message.clientId;
                    const isAvatarShown = !isMyMessage && (nextMessage === undefined || nextMessage.clientId !== message.clientId);

                    return (
                        <div
                            key={index}
                            className={classNames(
                                styles.messageContainer,
                                isMyMessage && styles.messageContainerMine,
                                hasNextMessageIndent && styles.messageContainerNextMessageIndent
                            )}
                        >
                            {!isMyMessage && (
                                <div className={styles.avatarWrapper}>
                                    {isAvatarShown && (
                                        <Gravatar email={message.clientId} className={styles.avatar}/>
                                    )}
                                </div>
                            )}
                            <Message message={message} isMine={isMyMessage}/>
                        </div>
                    );
                })
            ) : (
                <Typography variant="subtitle2" align="center" className={styles.noMessages}>
                    No messages yet
                </Typography>
            )}
        </div>
    );
};

export default Messages;
