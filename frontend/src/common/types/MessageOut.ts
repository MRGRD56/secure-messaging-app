import MessageIn from './MessageIn';
import UpdateOutBase from './UpdateOutBase';

interface MessageOut extends MessageIn, UpdateOutBase {
    type: 'message';
    id: string;
}

export default MessageOut;
