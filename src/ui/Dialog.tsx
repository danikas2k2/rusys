import { Interactive } from '@ui/Interactive';
import { Portal } from '@ui/Portal';
import React, {
    type DialogHTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type SyntheticEvent,
    useCallback,
    useEffect,
} from 'react';
import { usePreviousValue } from '~/hooks/usePreviousValue';
import cx from './Dialog.less';

export interface DialogProps extends DialogHTMLAttributes<HTMLDivElement> {
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
export function Dialog({
    open,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
    className,
    onOpen,
    onClose,
    ...props
}: DialogProps) {
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

    return open ? (
        <Portal>
            <Interactive
                className={cx('Backdrop')}
                role="complementary"
                aria-label="backdrop"
                onClick={closeOnOutsideClick ? onClose : undefined}
                onKeyDown={closeOnEscape ? handleEscape : undefined}
            >
                <Interactive className={cx('Dialog', className)} role="dialog" onClick={stopPropagation} {...props}>
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;
}
