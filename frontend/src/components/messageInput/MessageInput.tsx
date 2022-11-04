import React, {ChangeEvent, FormEvent,
    FormEventHandler, FunctionComponent, HTMLProps, KeyboardEvent, useCallback, useRef} from 'react';
import classNames from 'classnames';
import styles from './MessageInput.module.scss';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import {AttachFile} from '@mui/icons-material';
import readFileAsDataUrl from '../../utils/readFileAsDataUrl';
import MessageAttachment from '../../common/types/MessageAttachment';
import canSendMessage from '../../utils/canSendMessage';

interface Props extends Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'value' | 'onChange' | 'onInput'> {
    onSend(): void;
    value: string;
    onTextChange(value: string): void;
    secretKey: string;
    onInput?: FormEventHandler<HTMLTextAreaElement>;
    attachments: MessageAttachment[];
    onAttachmentsChange: (files: MessageAttachment[]) => void;
}

const MessageInput: FunctionComponent<Props> = ({onSend, className, value, onTextChange, secretKey, onInput, attachments, onAttachmentsChange, ...props}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messageAttachmentInputRef = useRef<HTMLInputElement>(null);

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

    const handleUploadAttachmentsClick = useCallback(() => {
        const fileInput = messageAttachmentInputRef.current;
        if (fileInput) {
            fileInput.value = null as any;
            fileInput.click();
        }
    }, []);

    const handleAttachmentsUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.currentTarget.files) {
            return;
        }

        const result: MessageAttachment[] = [];

        const files = Array.from(event.currentTarget.files);
        for (const file of files) {
            const content = await readFileAsDataUrl(file);
            result.push({
                name: file.name,
                mime: file.type,
                size: file.size,
                content
            });
        }

        onAttachmentsChange([
            ...attachments,
            ...result
        ]);
    }, [attachments, onAttachmentsChange]);

    return (
        <form {...props} className={classNames(styles.container, className)} onSubmit={handleFormSubmit}>
            <IconButton type="button"
                        color="default"
                        onClick={handleUploadAttachmentsClick}
            >
                <AttachFile/>
                <input
                    ref={messageAttachmentInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleAttachmentsUpload}
                />
            </IconButton>
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
                        color={canSendMessage(secretKey, value, attachments) ? 'primary' : 'default'}
                        className={styles.sendButton}
                        onClick={handleSendButtonClick}>
                <SendIcon/>
            </IconButton>
        </form>
    );
};

export default MessageInput;
