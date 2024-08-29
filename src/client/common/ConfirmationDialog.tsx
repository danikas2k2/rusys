import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DoneIcon from '@icons/Done.svg';
import { Button, type ButtonProps, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { type ReactNodeOrFunction, renderElement } from '@ui/utils/renderElement';
import React, { type MouseEvent, type ReactNode, useEffect } from 'react';
import { Label } from '~/client/common/Label';
import cx from './ConfirmationDialog.less';

export interface ConfirmationDialogProps {
    header?: ReactNode; // TODO (options?: HeaderOptions}) => ReactNode;
    footer?: ReactNode; // TODO (options?: FooterOptions}) => ReactNode;
    confirmButton?: ReactNodeOrFunction<ButtonProps>;
    confirmProps?: ButtonProps;
    cancelButton?: ReactNodeOrFunction<ButtonProps>;
    cancelProps?: ButtonProps;
    // TODO add `trigger: ReactNode | ({ open, onOpen, onClose }) => ReactNode` prop, then remove `open` prop
    open?: boolean;
    onConfirm?: (e: MouseEvent<HTMLButtonElement>) => void;
    onClose?: () => void;
    closeLabel?: string;
    className?: string;
    children?: ReactNode;
}

const defaultConfirmProps: ButtonProps = {
    variant: 'solid',
    color: 'primary',
    startDecorator: <DoneIcon />,
    children: <Label>Confirm</Label>,
};

const defaultCancelProps: ButtonProps = {
    variant: 'outlined',
    startDecorator: <CancelIcon />,
    children: <Label>Cancel</Label>,
};

export function ConfirmationDialog({
    header = <Label>Are you sure?</Label>,
    footer,
    confirmProps,
    confirmButton = <Button {...defaultConfirmProps} />,
    cancelProps,
    cancelButton = <Button {...defaultCancelProps} />,
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
                        {renderElement<ButtonProps>(
                            cancelButton,
                            {
                                ...cancelProps,
                                onClick: onClose,
                            },
                            defaultCancelProps
                        )}
                        {renderElement<ButtonProps>(
                            confirmButton,
                            {
                                ...confirmProps,
                                ref: focusRef,
                                onClick: onConfirm,
                            },
                            defaultConfirmProps
                        )}
                    </>
                )}
            </footer>
        </Dialog>
    );
}
