import React, {FunctionComponent, ReactNode, useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Popover, PopoverProps} from '@mui/material';

interface Props extends Omit<PopoverProps, 'open' | 'anchorEl'> {
    popover: ReactNode;
    children: ReactNode;
}

/** @deprecated not working */
const TogglePopover: FunctionComponent<Props> = ({children, id, onClose, popover, ...props}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleAnchorClick = useCallback((event: Event) => {
        setAnchorEl(event.currentTarget as Element);
    }, []);

    const handleClose = (...params: [any, any]) => {
        setAnchorEl(undefined);

        if (onClose) {
            onClose(...params);
        }
    };

    const open = Boolean(anchorEl);

    useLayoutEffect(() => {
        debugger;
        const popover = popoverRef.current;
        if (!popover) {
            return;
        }

        const clickable = popover.previousSibling;
        if (!clickable) {
            return;
        }

        clickable.addEventListener('click', handleAnchorClick);

        return () => {
            clickable.removeEventListener('click', handleAnchorClick);
        };
    }, []);

    return (
        <>
            {children}
            <Popover
                ref={popoverRef}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                {...props}
            >
                {popover}
            </Popover>
        </>
    );
};

export default TogglePopover;
