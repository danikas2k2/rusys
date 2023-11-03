import Interactive from '@ui/Interactive';
import Portal from '@ui/Portal';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, {
    type DialogHTMLAttributes,
    type KeyboardEvent,
    memo,
    type ReactNode,
    type RefObject,
    type SyntheticEvent,
    useCallback,
    useEffect,
} from 'react';
import usePreviousValue from '~/hooks/usePreviousValue';
import './Dropdown.less';

export interface DropdownProps extends DialogHTMLAttributes<HTMLDivElement> {
    anchor?: RefObject<HTMLElement | null>;
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    children?: ReactNode;
}

/**
 * TODO refactor to use <dialog/>
 * TODO refactor to use `useFocusTrap` hook
 */
export default memo(function Dropdown({
    open,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
    className,
    onOpen,
    onClose,
    ...props
}: DropdownProps) {
    const wasOpen = usePreviousValue(open) ?? open;
    useEffect(() => {
        if (!wasOpen) {
            onOpen?.();
        }
    }, [onOpen, open, wasOpen]);

    const handleEscape = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        },
        [onClose]
    );

    const stopPropagation = useCallback((e: SyntheticEvent) => e.stopPropagation(), []);

    const rect = props.anchor?.current?.getBoundingClientRect();
    const insetInlineStart = rect?.x ?? 0;
    const insetBlockStart = (rect?.y ?? 0) + (rect?.height ?? 0);

    return open ? (
        <Portal>
            <Interactive
                className="Backdrop"
                role="presentation"
                onClick={closeOnOutsideClick ? onClose : undefined}
                onKeyDown={closeOnEscape ? handleEscape : undefined}
            >
                <Interactive
                    className={classNames('Dropdown', className)}
                    role="listbox"
                    onClick={stopPropagation}
                    {...props}
                    style={{ insetInlineStart, insetBlockStart }}
                >
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;
}, isEqual);
