import React, {FunctionComponent, useMemo} from 'react';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import moment from 'moment';
import styles from './Message.module.scss';
import classNames from 'classnames';

interface Props {
    message: MessageOut;
    isMine: boolean;
}

const Message: FunctionComponent<Props> = ({message, isMine}) => {
    const text = message.encryptedText;
    const date = useMemo(() => {
        return moment(message.date).format('HH:mm');
    }, [message.date]);

    return (
        <div className={classNames(styles.message, {[styles.myMessage]: isMine})}>
            <div className={styles.text}>
                {text}
            </div>
            <div className={styles.date}>
                {date}
            </div>
        </div>
    );
};

export default Message;
