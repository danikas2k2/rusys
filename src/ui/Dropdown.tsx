import React, {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    type DialogHTMLAttributes,
    type KeyboardEvent,
    type MouseEventHandler,
    type ReactElement,
    type ReactNode,
    type RefAttributes,
    type RefObject,
    type SyntheticEvent,
} from 'react';

import { Interactive } from '@ui/Interactive';
import { Portal } from '@ui/Portal';

import cx from './Dropdown.pcss';

interface DropdownTriggerElementProps {
    onClick: MouseEventHandler;
    ref?: RefObject<HTMLElement | null> | ((node: HTMLElement | null) => void);
}

interface DropdownTriggerFunctionProps {
    open: MouseEventHandler;
}

export interface DropdownProps extends DialogHTMLAttributes<HTMLDivElement>, RefAttributes<DropdownRef> {
    open?: boolean;
    hover?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    anchor?: RefObject<HTMLElement | null> | [RefObject<HTMLElement | null>, RefObject<HTMLElement | null>]; // single anchor, or horizontal and vertical anchors
    trigger?: ReactElement<DropdownTriggerElementProps> | ((props: DropdownTriggerFunctionProps) => ReactNode);
    autoWidth?: boolean;
    children?: ReactNode;
}

export interface DropdownRef {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    getDialogElement: () => HTMLElement | null;
}

// TODO add translation context and translate backdrop label
export function Dropdown({
    ref,
    anchor,
    trigger,
    autoWidth = true,
    open: initialOpen = false,
    hover,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
    className,
    onOpen,
    onClose,
    ...props
}: DropdownProps) {
    const [open, setOpen] = useState(initialOpen);
    useEffect(() => {
        if (open !== initialOpen) {
            (open ? onOpen : onClose)?.();
        }
    }, [initialOpen, onClose, onOpen, open]);

    const handleOpen = useCallback(() => {
        if (!open) {
            setOpen(true);
        }
    }, [open]);

    const handleClose = useCallback(() => {
        if (open) {
            setOpen(false);
            onClose?.();
        }
    }, [onClose, open]);

    const handleToggle = useCallback(() => {
        if (open) {
            handleClose();
        } else {
            handleOpen();
        }
    }, [handleClose, handleOpen, open]);

    const dialogRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        isOpen: open,
        open: handleOpen,
        close: handleClose,
        toggle: handleToggle,
        getDialogElement: () => dialogRef.current,
    }));

    const handleEscape = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        },
        [handleClose]
    );

    const stopPropagation = useCallback((e: SyntheticEvent) => e.stopPropagation(), []);

    const triggerRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState({
        insetInlineStart: 0,
        insetBlockStart: 0,
        minWidth: 0,
        width: 'auto' as string | number,
    });

    const anchors = Array.isArray(anchor) ? anchor : [anchor, anchor];
    const hAnchor = anchors[0] ?? triggerRef;
    const vAnchor = anchors[1] ?? triggerRef;

    const updatePosition = useCallback(() => {
        if (!open) {
            return;
        }

        const h = hAnchor?.current?.getBoundingClientRect();
        const v = vAnchor?.current?.getBoundingClientRect();

        if (h && v) {
            const insetInlineStart = h.x + window.scrollX;
            const insetBlockStart = v.y + window.scrollY + (hover ? 0 : v.height);
            const minWidth = h.width;
            const width = autoWidth ? 'auto' : minWidth;

            setPosition({
                insetInlineStart,
                insetBlockStart,
                minWidth,
                width,
            });
        }
    }, [open, hAnchor, vAnchor, hover, autoWidth]);

    useEffect(() => {
        updatePosition();
    }, [updatePosition]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open, updatePosition]);

    const dropdown = open ? (
        <Portal>
            <Interactive
                className={cx('Backdrop')}
                role="complementary"
                aria-label="backdrop"
                onClick={closeOnOutsideClick ? handleClose : undefined}
                onKeyDown={closeOnEscape ? handleEscape : undefined}
            >
                <Interactive
                    ref={dialogRef}
                    className={cx('Dropdown', { hover }, className)}
                    role="dialog"
                    onClick={stopPropagation}
                    {...props}
                    style={{
                        insetInlineStart: `${position.insetInlineStart}px`,
                        insetBlockStart: `${position.insetBlockStart}px`,
                        minWidth: `${position.minWidth}px`,
                        width: typeof position.width === 'number' ? `${position.width}px` : position.width,
                    }}
                >
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;

    return (
        <>
            {trigger &&
                (isValidElement(trigger) ? (
                    // eslint-disable-next-line react-hooks/refs -- ref is needed here
                    cloneElement<DropdownTriggerElementProps>(trigger, { ref: triggerRef, onClick: handleToggle })
                ) : (
                    <Interactive tag="span" ref={triggerRef} onClick={handleToggle}>
                        {typeof trigger === 'function' ? trigger({ open: handleOpen }) : trigger}
                    </Interactive>
                ))}
            {dropdown}
        </>
    );
}
