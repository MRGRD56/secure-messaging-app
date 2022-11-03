import MessageIn from '../common/types/MessageIn';
import MessageOut from '../common/types/MessageOut';

export const encryptMessage = async (message: MessageIn, key: string): Promise<MessageIn> => ({
    ...message,
    encryptedText: CryptoJS.AES.encrypt(message.encryptedText, key).toString(CryptoJS.format.Hex)
});

export const decryptMessage = (message: MessageOut, key: string): MessageOut => ({
    ...message,
    encryptedText: CryptoJS.AES.decrypt(message.encryptedText, key).toString(CryptoJS.enc.Utf8)
});
