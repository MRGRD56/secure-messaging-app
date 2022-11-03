import React, {ChangeEvent, FormEvent, FunctionComponent, HTMLProps, KeyboardEvent, useCallback, useRef} from 'react';
import classNames from 'classnames';
import styles from './MessageInput.module.scss';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import {FormEventHandler} from '.react-exGgXXJA';

interface Props extends Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'value' | 'onChange' | 'onInput'> {
    onSend(): void;
    value: string;
    onTextChange(value: string): void;
    secretKey: string;
    onInput?: FormEventHandler<HTMLTextAreaElement>;
}

const MessageInput: FunctionComponent<Props> = ({onSend, className, value, onTextChange, secretKey, onInput, ...props}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

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

    const handleSendButtonClick = useCallback(() => {
        const input = inputRef.current;
        if (!input) {
            return;
        }

        input.focus();
    }, []);

    return (
        <form {...props} className={classNames(styles.container, className)} onSubmit={handleFormSubmit}>
            <textarea
                className={styles.input}
                placeholder="Message"
                value={value}
                onChange={handleTextChange}
                rows={1}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                id="message-input-field"
                onInput={onInput}
            />
            <IconButton type="submit"
                        color={value && secretKey ? 'primary' : 'default'}
                        className={styles.sendButton}
                        onClick={handleSendButtonClick}>
                <SendIcon/>
            </IconButton>
        </form>
    );
};

export default MessageInput;
