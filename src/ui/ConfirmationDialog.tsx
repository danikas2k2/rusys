import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DoneIcon from '@icons/Done.svg';
import { Button } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { IconButton } from '@ui/IconButton';
import { type InputColor } from '@ui/Input';
import React, { type MouseEvent, type ReactNode, useEffect } from 'react';
import cx from './ConfirmationDialog.less';

export interface ConfirmationDialogProps {
    header?: ReactNode; // TODO (options?: HeaderOptions}) => ReactNode;
    footer?: ReactNode; // TODO (options?: FooterOptions}) => ReactNode;
    confirm?: ReactNode; // TODO (options?: ButtonOptions}) => ReactNode;
    confirmLabel?: string;
    confirmColor?: InputColor; // TODO get rid of this
    cancel?: ReactNode; // TODO (options?: ButtonOptions}) => ReactNode;
    cancelLabel?: string;
    cancelColor?: InputColor; // TODO get rid of this
    // TODO add `trigger: ReactNode | ({ open, onOpen, onClose }) => ReactNode` prop, then remove `open` prop
    open?: boolean;
    onConfirm?: (e: MouseEvent<HTMLButtonElement>) => void;
    onClose?: () => void;
    closeLabel?: string;
    className?: string;
    children?: ReactNode;
}

export function ConfirmationDialog({
    header = 'Are you sure?',
    footer,
    confirm,
    confirmColor = 'primary',
    confirmLabel = 'Confirm',
    cancel,
    cancelColor,
    cancelLabel = 'Cancel',
    open,
    onConfirm,
    onClose,
    closeLabel = 'Close',
    className,
    children,
}: ConfirmationDialogProps) {
    const focusRef = useAutoFocus<HTMLButtonElement>();
    useEffect(() => {
        if (open) {
            focusRef?.focus();
        }
    }, [open, focusRef]);
    return (
        <Dialog
            role="alertdialog"
            className={cx('ConfirmationDialog', className)}
            open={open}
            closeOnOutsideClick
            closeOnEscape
            onClose={onClose}
        >
            <header>
                <div className={cx('title')}>{header}</div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>{children}</main>
            <footer>
                {footer || (
                    <>
                        <Button variant="outlined" color={cancelColor} aria-label={cancelLabel} onClick={onClose}>
                            {cancel || (
                                <>
                                    <CancelIcon />
                                    {cancelLabel}
                                </>
                            )}
                        </Button>
                        <Button
                            ref={focusRef}
                            variant="solid"
                            color={confirmColor}
                            aria-label={confirmLabel}
                            onClick={onConfirm}
                        >
                            {confirm || (
                                <>
                                    <DoneIcon />
                                    {confirmLabel}
                                </>
                            )}
                        </Button>
                    </>
                )}
            </footer>
        </Dialog>
    );
}
