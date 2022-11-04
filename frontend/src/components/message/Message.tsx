import React, {FunctionComponent, useEffect, useMemo, useRef} from 'react';
import moment from 'moment';
import styles from './Message.module.scss';
import classNames from 'classnames';
import MessageOut from '../../common/types/MessageOut';
import ReceivedAttachment from '../receivedAttachment/ReceivedAttachment';
import getFileType, {FileType} from '../../utils/getFileType';
import {TypedMessageAttachment} from '../../common/types/MessageAttachment';
import Viewer from 'viewerjs';

interface Props {
    message: MessageOut;
    isMine: boolean;
}

const Message: FunctionComponent<Props> = ({message, isMine}) => {
    const text = message.encryptedText;
    const date = useMemo(() => {
        return moment(message.date).format('HH:mm');
    }, [message.date]);

    const imageAttachmentsContainerRef = useRef<HTMLDivElement>(null);

    const attachments = useMemo<TypedMessageAttachment[]>(() => {
        return message.attachments?.map(attachment => {
            return {
                ...attachment,
                type: getFileType(attachment.mime)
            };
        }) ?? [];
    }, [message.attachments]);

    const imageAttachments = useMemo(() => {
        return attachments.filter(({type}) => type === FileType.IMAGE);
    }, [attachments]);

    const videoAttachments = useMemo(() => {
        return attachments.filter(({type}) => type === FileType.VIDEO);
    }, [attachments]);

    const audioAttachments = useMemo(() => {
        return attachments.filter(({type}) => type === FileType.AUDIO);
    }, [attachments]);

    const fileAttachments = useMemo(() => {
        return attachments.filter(({type}) => type === FileType.OTHER);
    }, [attachments]);

    useEffect(() => {
        const imageAttachmentsContainer = imageAttachmentsContainerRef.current;
        if (!imageAttachmentsContainer) {
            return;
        }

        const viewer = new Viewer(imageAttachmentsContainer);

        return () => {
            viewer.destroy();
        };
    }, [imageAttachments]);

    return (
        <div className={classNames(styles.message, {[styles.myMessage]: isMine})}>
            <div className={styles.text}>
                {text}
                {(attachments.length > 0) && (
                    <div className={styles.messageAttachmentsContainer}>
                        {imageAttachments.length > 0 && (
                            <div className={styles.imageVideoAttachmentsContainer} ref={imageAttachmentsContainerRef}>
                                {imageAttachments.map((attachment, index) => (
                                    <ReceivedAttachment key={index} attachment={attachment}/>
                                ))}
                            </div>
                        )}
                        {videoAttachments.length > 0 && (
                            <div className={styles.imageVideoAttachmentsContainer}>
                                {videoAttachments.map((attachment, index) => (
                                    <ReceivedAttachment key={index} attachment={attachment}/>
                                ))}
                            </div>
                        )}
                        {audioAttachments.length > 0 && (
                            <div className={styles.audioAttachmentsContainer}>
                                {audioAttachments.map((attachment, index) => (
                                    <ReceivedAttachment key={index} attachment={attachment}/>
                                ))}
                            </div>
                        )}
                        {fileAttachments.length > 0 && (
                            <div className={styles.fileAttachmentsContainer}>
                                {fileAttachments.map((attachment, index) => (
                                    <ReceivedAttachment key={index} attachment={attachment}/>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.date}>
                {date}
            </div>
        </div>
    );
};

export default Message;
