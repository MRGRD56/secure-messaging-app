import MessageIn from '../common/types/MessageIn';
import sha256 from './sha256';
import MessageOut from '../common/types/MessageOut';

export const encryptMessage = async (message: MessageIn, key: string): Promise<MessageIn> => ({
    ...message,
    keyHash: sha256(message.keyHash),
    encryptedText: CryptoJS.AES.encrypt(message.encryptedText, key).toString(CryptoJS.format.Hex)
});

export const decryptMessage = (message: MessageOut, key: string): MessageOut => ({
    ...message,
    encryptedText: CryptoJS.AES.decrypt(message.encryptedText, key).toString(CryptoJS.enc.Utf8)
});
