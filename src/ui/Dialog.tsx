import Interactive from '@ui/Interactive';
import Portal from '@ui/Portal';
import classNames from 'classnames';
import type { DialogHTMLAttributes, ReactNode } from 'react';
import React, { memo, useEffect } from 'react';
import usePreviousValue from '~/hooks/usePreviousValue';
import { onEscapeKey, stopPropagation } from '~/utils/events';
import './Dialog.less';

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
export default memo(function Dialog({
    open,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    children,
    className,
    onOpen,
    onClose,
    ...props
}: DialogProps): JSX.Element | null {
    const wasOpen = usePreviousValue(open) ?? open;
    useEffect(() => {
        if (!wasOpen) {
            onOpen?.();
        }
    }, [onOpen, open, wasOpen]);

    return open ? (
        <Portal>
            <Interactive
                className="Backdrop"
                role="presentation"
                onClick={closeOnOutsideClick ? onClose : undefined}
                onKeyDown={closeOnEscape ? onEscapeKey(onClose) : undefined}
            >
                <Interactive
                    className={classNames('Dialog', className)}
                    role="dialog"
                    onClick={stopPropagation()}
                    {...props}
                >
                    {children}
                </Interactive>
            </Interactive>
        </Portal>
    ) : null;
});
