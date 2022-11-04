import MessageAttachment from '../common/types/MessageAttachment';

const canSendMessage = (key: string, text: string, attachments: MessageAttachment[]): boolean => {
    return Boolean(key && (text || attachments.length > 0));
};

export default canSendMessage;
