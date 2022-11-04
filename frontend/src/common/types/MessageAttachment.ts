import {FileType} from '../../utils/getFileType';

interface MessageAttachment {
    name: string;
    mime: string;
    size: number;
    content: string;
}

export interface TypedMessageAttachment extends MessageAttachment {
    type: FileType;
}

export default MessageAttachment;
