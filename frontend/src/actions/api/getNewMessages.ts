import MessageOut from '@secure-messaging-app/common/types/MessageOut';
import appAxios from '../../utils/http/appAxios';
import GetNewMessagesParams from '@secure-messaging-app/common/types/GetNewMessagesParams';
import {decryptMessage} from '../../utils/MessageCrypto';
import sha256 from '../../utils/sha256';

const getNewMessages = async (params: GetNewMessagesParams, key: string, signal?: AbortSignal): Promise<MessageOut[]> => {
    const response = await appAxios.post<MessageOut[]>('/api/message/get-new', {
        clientId: params.clientId,
        keyHash: sha256(params.keyHash)
    }, {
        timeout: 60_000,
        signal
    });
    const encryptedMessages = response.data;

    return encryptedMessages.map(encryptedMessage => {
        return decryptMessage(encryptedMessage, key);
    });
};

export default getNewMessages;
