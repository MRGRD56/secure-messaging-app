import React, {FunctionComponent} from 'react';
import {TypedMessageAttachment} from '../../common/types/MessageAttachment';
import {FileType} from '../../utils/getFileType';
import styles from './ReceivedAttachment.module.scss';
import {FileDownload} from '@mui/icons-material';
import {ButtonBase} from '@mui/material';
import prettyBytes from 'pretty-bytes';

interface Props {
    attachment: TypedMessageAttachment;
}

export const ImageAttachment: FunctionComponent<Props> = ({attachment}) => {
    return (
        <div className={styles.attachmentImage} title={attachment.name}>
            <img src={attachment.content} alt={attachment.name} className={styles.attachmentImageSelf}/>
        </div>
    );
};

export const VideoAttachment: FunctionComponent<Props> = ({attachment}) => {
    return (
        <div className={styles.attachmentVideo}>
            <video className={styles.attachmentVideoSelf} controls>
                <source src={attachment.content}/>
            </video>
        </div>
    );
};

export const AudioAttachment: FunctionComponent<Props> = ({attachment}) => {
    return (
        <div className={styles.attachmentAudio} title={attachment.name}>
            <audio className={styles.attachmentAudioSelf} controls>
                <source src={attachment.content}/>
            </audio>
        </div>
    );
};

export const FileAttachment: FunctionComponent<Props> = ({attachment}) => {
    return (
        <ButtonBase className={styles.attachmentFile}
                    component="a"
                    href={attachment.content}
                    download={attachment.name}
                    title={attachment.name}
        >
            <div className={styles.attachmentFileSelf}>
                <div className={styles.attachmentFileIconWrapper}>
                    <div className={styles.attachmentFileIcon}>
                        <FileDownload fontSize="medium"/>
                    </div>
                </div>
                <div className={styles.attachmentFileNameContainer}>
                    <div className={styles.attachmentFileName}>{attachment.name}</div>
                    <div className={styles.attachmentFileSize}>{prettyBytes(attachment.size)}</div>
                </div>
            </div>
        </ButtonBase>
    );
};

const ReceivedAttachment: FunctionComponent<Props> = ({attachment}) => {
    const fileType = attachment.type;

    return (
        <>
            {fileType === FileType.IMAGE && <ImageAttachment attachment={attachment}/>}
            {fileType === FileType.VIDEO && <VideoAttachment attachment={attachment}/>}
            {fileType === FileType.AUDIO && <AudioAttachment attachment={attachment}/>}
            {fileType === FileType.OTHER && <FileAttachment attachment={attachment}/>}
        </>
    );
};

export default ReceivedAttachment;
