import appAxios from '../../utils/http/appAxios';
import {decryptMessage} from '../../utils/MessageCrypto';
import GetNewUpdatesParams from '../../common/types/GetNewUpdatesParams';
import UpdateOut from '../../common/types/UpdateOut';

const getNewUpdates = async (params: GetNewUpdatesParams, key: string, signal?: AbortSignal): Promise<UpdateOut[]> => {
    const response = await appAxios.post<UpdateOut[]>('/api/message/get-new', {
        clientId: params.clientId,
        chatId: params.chatId
    }, {
        timeout: 60_000,
        signal
    });
    const updates = response.data;

    return updates.map(update => {
        if (update.type === 'message') {
            return decryptMessage(update, key);
        }

        return update;
    });
};

export default getNewUpdates;
