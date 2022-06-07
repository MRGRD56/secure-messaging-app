import React, {FunctionComponent} from 'react';
import styles from './Messages.module.scss';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import Message from '../message/Message';
import classNames from 'classnames';
import {Typography} from '@mui/material';

interface Props {
    messages: MessageOut[];
    clientId: string;
    className?: string;
}

const Messages: FunctionComponent<Props> = ({clientId, messages, className}) => {
    return (
        <div className={classNames(styles.container, className)}>
            {messages.length > 0 ? (
                messages.map((message, index) => (
                    <Message key={index} message={message} isMine={clientId === message.clientId}/>
                ))
            ) : (
                <Typography variant="subtitle2" align="center" className={styles.noMessages}>
                    No messages yet
                </Typography>
            )}
        </div>
    );
};

export default Messages;
