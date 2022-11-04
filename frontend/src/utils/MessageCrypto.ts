import MessageIn from '../common/types/MessageIn';
import MessageOut from '../common/types/MessageOut';

const encryptText = (text: string, key: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString(CryptoJS.format.Hex);
};

const decryptText = (encryptedText: string, key: string): string => {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
};

export const encryptMessage = async (message: MessageIn, key: string): Promise<MessageIn> => ({
    ...message,
    encryptedText: CryptoJS.AES.encrypt(message.encryptedText, key).toString(CryptoJS.format.Hex),
    attachments: message.attachments?.map(attachment => {
        return {
            ...attachment,
            content: encryptText(attachment.content, key)
        };
    })
});

export const decryptMessage = (message: MessageOut, key: string): MessageOut => ({
    ...message,
    encryptedText: CryptoJS.AES.decrypt(message.encryptedText, key).toString(CryptoJS.enc.Utf8),
    attachments: message.attachments?.map(attachment => {
        return {
            ...attachment,
            content: decryptText(attachment.content, key)
        };
    })
});
