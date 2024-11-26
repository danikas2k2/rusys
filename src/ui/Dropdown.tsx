import { Interactive } from '@ui/Interactive';
import { Portal } from '@ui/Portal';
import React, {
    cloneElement,
    type DialogHTMLAttributes,
    forwardRef,
    isValidElement,
    type KeyboardEvent,
    type MouseEventHandler,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefObject,
    type SyntheticEvent,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { usePreviousValue } from '~/common/hooks/usePreviousValue';
import cx from './Dropdown.less';

interface DropdownTriggerElementProps {
    onClick: MouseEventHandler;
    ref: RefObject<HTMLElement | null>;
}

interface DropdownTriggerFunctionProps {
    open: MouseEventHandler;
}

export interface DropdownProps extends DialogHTMLAttributes<HTMLDivElement> {
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
export const Dropdown = forwardRef(function Dropdown(
    {
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
    }: DropdownProps,
    ref: Ref<DropdownRef>
) {
    const [open, setOpen] = useState(initialOpen);
    useEffect(() => {
        if (open !== initialOpen) {
            setOpen(initialOpen);
        }
        // Don't add `open` to the dependencies array, it will cause infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOpen]);

    const wasOpen = usePreviousValue(open) ?? open;
    useEffect(() => {
        if (open !== wasOpen) {
            (open ? onOpen : onClose)?.();
        }
    }, [onClose, onOpen, open, wasOpen]);

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
    const anchors = Array.isArray(anchor) ? anchor : [anchor, anchor];
    const hAnchor = anchors[0] ?? triggerRef;
    const h = hAnchor?.current?.getBoundingClientRect();
    const vAnchor = anchors[1] ?? triggerRef;
    const v = vAnchor?.current?.getBoundingClientRect();
    const insetInlineStart = (h?.x ?? 0) + window.scrollX;
    const insetBlockStart = (v?.y ?? 0) + window.scrollY + (hover ? 0 : (v?.height ?? 0));
    const minWidth = h?.width ?? 0;
    const width = autoWidth ? 'auto' : minWidth;

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
                        insetInlineStart,
                        insetBlockStart,
                        minWidth,
                        width,
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
                    cloneElement<DropdownTriggerElementProps>(trigger, { ref: triggerRef, onClick: handleToggle })
                ) : (
                    <Interactive tag="span" ref={triggerRef} onClick={handleToggle}>
                        {typeof trigger === 'function' ? trigger({ open: handleOpen }) : trigger}
                    </Interactive>
                ))}
            {dropdown}
        </>
    );
});
