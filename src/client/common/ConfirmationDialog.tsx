import React, { cloneElement, useEffect, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import DoneIcon from '@assets/done.svg';
import { Button, IconButton, type ButtonProps } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { Label } from '~/client/common/Label';
import cx from './ConfirmationDialog.less';

export interface ConfirmationDialogProps {
    header?: ReactElement;
    footer?: ReactElement;
    confirmButton?: ReactElement<ButtonProps>;
    cancelButton?: ReactElement<ButtonProps>;
    // TODO add `trigger: ReactNode | ({ open, onOpen, onClose }) => ReactNode` prop, then remove `open` prop
    open?: boolean;
    onConfirm?: (e: MouseEvent<HTMLButtonElement>) => void;
    onClose?: () => void;
    closeLabel?: string;
    className?: string;
    children?: ReactNode;
}

export const confirmButtonProps: ButtonProps = {
    variant: 'solid',
    color: 'primary',
    startDecorator: <DoneIcon />,
    children: <Label>Confirm</Label>,
};

export const cancelButtonProps: ButtonProps = {
    variant: 'outlined',
    startDecorator: <CancelIcon />,
    children: <Label>Cancel</Label>,
};

export function ConfirmationDialog({
    header = <Label>Are you sure?</Label>,
    footer,
    confirmButton,
    cancelButton,
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
                        {cancelButton ? (
                            cloneElement(cancelButton, {
                                ...cancelButtonProps,
                                ...cancelButton.props,
                                onClick: onClose,
                            })
                        ) : (
                            <Button {...cancelButtonProps} onClick={onClose} />
                        )}
                        {confirmButton ? (
                            cloneElement(confirmButton, {
                                ...confirmButtonProps,
                                ...confirmButton.props,
                                onClick: onConfirm,
                            })
                        ) : (
                            <Button {...confirmButtonProps} onClick={onConfirm} />
                        )}
                    </>
                )}
            </footer>
        </Dialog>
    );
}
