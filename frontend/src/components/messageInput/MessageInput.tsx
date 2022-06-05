import React, {ChangeEvent, FormEvent, FunctionComponent, HTMLProps, KeyboardEvent} from 'react';
import classNames from 'classnames';
import styles from './MessageInput.module.scss';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';

interface Props extends Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'value' | 'onChange'> {
    onSend(): void;
    value: string;
    onTextChange(value: string): void;
}

const MessageInput: FunctionComponent<Props> = ({onSend, className, value, onTextChange, ...props}) => {
    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSend();
    };

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onTextChange(event.target.value);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== 'Enter') {
            return;
        }

        if (!event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            onSend();
        }

        if (!event.shiftKey && event.ctrlKey) {
            onTextChange(value + '\n');
        }
    };

    return (
        <form {...props} className={classNames(styles.container, className)} onSubmit={handleFormSubmit}>
            <textarea
                className={styles.input}
                placeholder="Message"
                value={value}
                onChange={handleTextChange}
                rows={1}
                onKeyDown={handleInputKeyDown}
            />
            <IconButton type="submit" color={value ? 'primary' : 'default'} className={styles.sendButton}>
                <SendIcon/>
            </IconButton>
        </form>
    );
};

export default MessageInput;
