import React, {
    useCallback,
    useEffect,
    useState,
    type DialogHTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type SyntheticEvent,
} from 'react';

import { Interactive } from '@ui/Interactive';
import { Portal } from '@ui/Portal';

import cx from './Dialog.pcss';

export interface DialogProps extends DialogHTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    fullscreen?: boolean;
    children?: ReactNode;
}

// TODO refactor to use <dialog/>
// TODO refactor to use `useFocusTrap` hook
// TODO add translation context and translate backdrop label
export function Dialog({
    open = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
    className,
    onOpen,
    onClose,
    fullscreen,
    ...props
}: DialogProps) {
    const [wasOpen] = useState(open);
    useEffect(() => {
        if (!wasOpen && open) {
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

    return wasOpen ? (
        <Portal>
            <Interactive
                className={cx('Backdrop')}
                role="complementary"
                aria-label="backdrop"
                onClick={closeOnOutsideClick ? onClose : undefined}
                onKeyDown={closeOnEscape ? handleEscape : undefined}
            >
                <Interactive
                    className={cx('Dialog', { fullscreen }, className)}
                    role="dialog"
                    onClick={stopPropagation}
                    {...props}
                >
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;
}
