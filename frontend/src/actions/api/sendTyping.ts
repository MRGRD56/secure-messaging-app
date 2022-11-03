import TypingIn from '../../common/types/TypingIn';
import appAxios from '../../utils/http/appAxios';

const sendTyping = async (typing: TypingIn): Promise<void> => {
    await appAxios.post('/api/message/typing', typing);
};

export default sendTyping;
