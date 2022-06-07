import React, {FunctionComponent, HTMLProps, useCallback, useState} from 'react';
import {
    FormControl,
    Input,
    InputAdornment,
    InputLabel,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {MoreHoriz, Share, Shuffle, Visibility, VisibilityOff} from '@mui/icons-material';
import {useToggle} from 'rooks';
import styles from './TopPanel.module.scss';
import classNames from 'classnames';
import queryString from 'query-string';
import {Base64} from 'js-base64';
import {BASE_URI} from '../../constants';
import Generate from 'generate-password-browser';

interface Props extends HTMLProps<HTMLDivElement> {
    secretKey: string;
    onSecretKeyChange: (secretKey: string) => void;
}

const TopPanel: FunctionComponent<Props> = ({secretKey, onSecretKeyChange, className, ...props}) => {
    const [isSecretKeyVisible, toggleSecretKeyVisible] = useToggle(false);

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

    const handlePopoverAnchorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const isPopoverOpen = Boolean(anchorEl);

    const handleShowKeyClick = useCallback(() => {
        toggleSecretKeyVisible(undefined);
        handlePopoverClose();
    }, [toggleSecretKeyVisible, handlePopoverClose]);

    const handleGenerateKeyClick = useCallback(() => {
        const randomSecretKey = Generate.generate({
            length: 64,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true,
            strict: true
        })
        onSecretKeyChange(randomSecretKey);
        handlePopoverClose();
    }, [onSecretKeyChange, handlePopoverClose]);

    const directLink = queryString.stringifyUrl({
        url: BASE_URI,
        query: {
            kb: Base64.encode(secretKey)
        }
    });

    const handleShareLinkKey = useCallback(() => {
        // window.location.href = queryString.stringifyUrl({
        //     url: BASE_URI,
        //     query: {
        //         kb: Base64.encode(secretKey)
        //     }
        // });
        handlePopoverClose();
    }, [queryString]);

    return (
        <div className={classNames(styles.topPanel, className)} {...props}>
            <FormControl variant="standard" className={styles.secretKeyInput}>
                <InputLabel htmlFor="secret-key-input">Secret key</InputLabel>
                <Input
                    id="secret-key-input"
                    type={isSecretKeyVisible ? 'text' : 'password'}
                    value={secretKey}
                    onChange={e => onSecretKeyChange(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handlePopoverAnchorClick}
                                aria-describedby="secret-key-popover"
                            >
                                {<MoreHoriz/>}
                            </IconButton>
                            <Menu
                                id="secret-key-popover"
                                open={isPopoverOpen}
                                onClose={handlePopoverClose}
                                anchorEl={anchorEl}
                            >
                                <MenuItem onClick={handleShowKeyClick}>
                                    <ListItemIcon>
                                        {isSecretKeyVisible ? <VisibilityOff/> : <Visibility/>}
                                    </ListItemIcon>
                                    <ListItemText>
                                        {isSecretKeyVisible ? 'Hide secret key' : 'Show secret key'}
                                    </ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleGenerateKeyClick}>
                                    <ListItemIcon>
                                        <Shuffle/>
                                    </ListItemIcon>
                                    <ListItemText>
                                        Generate random
                                    </ListItemText>
                                </MenuItem>
                                <Link href={directLink} underline="none" color="unset" onClick={handleShareLinkKey}>
                                    <MenuItem>
                                        <ListItemIcon>
                                            <Share/>
                                        </ListItemIcon>
                                        <ListItemText>
                                            Direct link
                                        </ListItemText>
                                    </MenuItem>
                                </Link>
                            </Menu>
                        </InputAdornment>
                    }
                />
            </FormControl>
        </div>
    );
};

export default TopPanel;
