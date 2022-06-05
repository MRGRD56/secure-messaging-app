import MessageIn from '@secure-messaging-app/common/types/MessageIn';
import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import sha256 from './sha256';

export const encryptMessage = async (message: MessageIn, key: string): Promise<MessageIn> => ({
    ...message,
    keyHash: sha256(message.keyHash),
    encryptedText: CryptoJS.AES.encrypt(message.encryptedText, key).toString(CryptoJS.format.Hex)
});

export const decryptMessage = (message: MessageOut, key: string): MessageOut => ({
    ...message,
    encryptedText: CryptoJS.AES.decrypt(message.encryptedText, key).toString(CryptoJS.enc.Utf8)
});
