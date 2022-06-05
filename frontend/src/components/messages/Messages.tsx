import React, {FunctionComponent} from 'react';
import styles from './Messages.module.scss';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import Message from '../message/Message';
import classNames from 'classnames';

interface Props {
    messages: MessageOut[];
    clientId: string;
    className?: string;
}

const Messages: FunctionComponent<Props> = ({clientId, messages, className}) => {
    return (
        <div className={classNames(styles.container, className)}>
            {messages.map((message, index) => (
                <Message key={index} message={message} isMine={clientId === message.clientId}/>
            ))}
        </div>
    );
};

export default Messages;
