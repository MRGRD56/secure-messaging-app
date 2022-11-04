import React, {FunctionComponent, useMemo} from 'react';
import MessageAttachment from '../../common/types/MessageAttachment';
import styles from './NewAttachment.module.scss';
import getFileType, {FileType} from '../../utils/getFileType';
import {AudioFile, Close, Image, InsertDriveFile, VideoFile} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import {ButtonBase} from '@mui/material';

interface Props {
    attachment: MessageAttachment;
    onRemove: () => void;
    onView: () => void;
}

const NewAttachment: FunctionComponent<Props> = ({attachment, onRemove, onView}) => {
    const fileType = useMemo<FileType>(() => {
        return getFileType(attachment.mime);
    }, [attachment.mime]);

    return (
        <div className={styles.container} title={attachment.name}>
            {fileType === FileType.IMAGE ? (
                <ButtonBase className={styles.imageAttachment} onClick={onView}>
                    <img src={attachment.content} alt={attachment.name} className={styles.imageAttachmentImg}/>
                    <div className={styles.imageAttachmentImgControl}>
                        <div className={styles.fileAttachment}>
                            <div className={styles.attachmentIcon}>
                                <Image fontSize="large"/>
                            </div>
                            <div className={styles.attachmentFileName}>
                                {attachment.name}
                            </div>
                        </div>
                    </div>
                </ButtonBase>
            ) : (
                <div className={styles.fileAttachment}>
                    <div className={styles.attachmentIcon}>
                        {fileType === FileType.VIDEO && (
                            <VideoFile fontSize="large"/>
                        )}
                        {fileType === FileType.AUDIO && (
                            <AudioFile fontSize="large"/>
                        )}
                        {fileType === FileType.OTHER && (
                            <InsertDriveFile fontSize="large"/>
                        )}
                    </div>
                    <div className={styles.attachmentFileName}>
                        {attachment.name}
                    </div>
                </div>
            )}
            <div className={styles.removeButtonContainer}>
                <IconButton size="small" className={styles.removeButton} title="Remove attachment" onClick={onRemove}>
                    <Close fontSize="small" className={styles.removeButtonIcon}/>
                </IconButton>
            </div>
        </div>
    );
};

export default NewAttachment;
