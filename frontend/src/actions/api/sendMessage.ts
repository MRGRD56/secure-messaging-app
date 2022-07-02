import appAxios from '../../utils/http/appAxios';
import {encryptMessage} from '../../utils/MessageCrypto';
import MessageIn from '../../common/types/MessageIn';

const sendMessage = async (message: MessageIn, key: string): Promise<void> => {
    const encryptedMessage: MessageIn = await encryptMessage(message, key);

    await appAxios.post('/api/message/send', encryptedMessage);
};

export default sendMessage;
