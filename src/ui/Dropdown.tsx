import Interactive from '@ui/Interactive';
import Portal from '@ui/Portal';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, {
    cloneElement,
    type DialogHTMLAttributes,
    isValidElement,
    type KeyboardEvent,
    memo,
    type MouseEventHandler,
    type ReactElement,
    type ReactNode,
    type RefObject,
    type SyntheticEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import usePreviousValue from '~/hooks/usePreviousValue';
import './Dropdown.less';

interface DropdownTriggerElementProps {
    onClick: MouseEventHandler;
    ref: RefObject<HTMLElement | null>;
}

interface DropdownTriggerFunctionProps {
    open: MouseEventHandler;
}

export interface DropdownProps extends DialogHTMLAttributes<HTMLDivElement> {
    anchor?: RefObject<HTMLElement | null>;
    open?: boolean;
    hover?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    trigger?: ReactElement<DropdownTriggerElementProps> | ((props: DropdownTriggerFunctionProps) => ReactNode);
    children?: ReactNode;
}

export default memo(function Dropdown({
    anchor,
    trigger,
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
            setOpen(initialOpen);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOpen]);

    const wasOpen = usePreviousValue(open) ?? open;
    useEffect(() => {
        if (!wasOpen) {
            onOpen?.();
        }
    }, [onOpen, open, wasOpen]);

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
    const rect = (anchor ?? triggerRef)?.current?.getBoundingClientRect();
    const insetInlineStart = rect?.x ?? 0;
    const insetBlockStart = (rect?.y ?? 0) + (hover ? 0 : rect?.height ?? 0);
    const minWidth = rect?.width ?? 0;

    const dropdown = open ? (
        <Portal>
            <Interactive
                className="Backdrop"
                role="presentation"
                onClick={closeOnOutsideClick ? handleClose : undefined}
                onKeyDown={closeOnEscape ? handleEscape : undefined}
            >
                <Interactive
                    className={classNames('Dropdown', { hover }, className)}
                    role="listbox"
                    onClick={stopPropagation}
                    {...props}
                    style={{
                        insetInlineStart,
                        insetBlockStart,
                        minWidth,
                    }}
                >
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;

    return (
        <>
            {isValidElement(trigger) ? (
                cloneElement<DropdownTriggerElementProps>(trigger, { ref: triggerRef, onClick: handleOpen })
            ) : (
                <Interactive tag="span" ref={triggerRef} onClick={handleOpen}>
                    {trigger instanceof Function ? trigger({ open: handleOpen }) : trigger}
                </Interactive>
            )}
            {dropdown}
        </>
    );
}, isEqual);
