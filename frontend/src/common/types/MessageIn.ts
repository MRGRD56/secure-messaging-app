import UpdateInBase from './UpdateInBase';
import MessageAttachment from './MessageAttachment';

interface MessageIn extends UpdateInBase {
    encryptedText: string;
    attachments?: MessageAttachment[];
}

export default MessageIn;
