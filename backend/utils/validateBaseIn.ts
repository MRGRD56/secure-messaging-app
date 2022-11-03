import UpdateInBase from '../common/types/UpdateInBase';
import isNonEmptyString from './isNonEmptyString';

const validateBaseIn = (updateIn: UpdateInBase) => {
    return isNonEmptyString(updateIn.clientId)
        && isNonEmptyString(updateIn.chatId);
};

export default validateBaseIn;
