import MessageIn from './MessageIn';

interface MessageOut extends MessageIn {
    date: string;
    id: string;
}

export default MessageOut;
