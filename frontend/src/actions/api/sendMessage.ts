import MessageIn from '@secure-messaging-app/common/types/MessageIn';
import appAxios from '../../utils/http/appAxios';
import {encryptMessage} from '../../utils/MessageCrypto';

const sendMessage = async (message: MessageIn, key: string): Promise<void> => {
    const encryptedMessage: MessageIn = await encryptMessage(message, key);

    await appAxios.post('/api/message/send', encryptedMessage);
};

export default sendMessage;
