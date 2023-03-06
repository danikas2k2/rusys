import CancelIcon from '@icons/Cancel.svg';
import DoneIcon from '@icons/Done.svg';
import Button from '@ui/Button';
import Dialog from '@ui/Dialog';
import useAutoFocus from '@ui/hooks/useAutoFocus';
import type { InputColor } from '@ui/Input';
import type { MouseEvent, ReactNode } from 'react';
import React, { memo, useEffect } from 'react';
import Label from '~/client/Label';

export interface ConfirmationDialogProps {
    header?: ReactNode; // TODO (options?: HeaderOptions}) => ReactNode;
    footer?: ReactNode; // TODO (options?: FooterOptions}) => ReactNode;
    confirm?: ReactNode; // TODO (options?: ButtonOptions}) => ReactNode;
    confirmColor?: InputColor; // TODO get rid of this
    cancel?: ReactNode; // TODO (options?: ButtonOptions}) => ReactNode;
    open?: boolean;
    onConfirm?: (e: MouseEvent<HTMLButtonElement>) => void;
    onClose?: () => void;
    className?: string;
    children?: ReactNode;
}

export default memo(function ConfirmationDialog({
    header,
    footer,
    confirm,
    confirmColor = 'primary',
    cancel,
    open,
    onConfirm,
    onClose,
    className,
    children,
}: ConfirmationDialogProps): JSX.Element {
    const focusRef = useAutoFocus<HTMLButtonElement>();
    useEffect(() => {
        if (open) {
            focusRef?.focus();
        }
    }, [open, focusRef]);
    return (
        <Dialog className={className} open={open} closeOnOutsideClick closeOnEscape onClose={onClose}>
            <header>{header || <Label>Are you sure?</Label>}</header>
            <main>{children}</main>
            <footer>
                {footer || (
                    <>
                        <Button variant="outlined" onClick={onClose}>
                            {cancel || (
                                <>
                                    <CancelIcon />
                                    <Label>Cancel</Label>
                                </>
                            )}
                        </Button>
                        <Button ref={focusRef} variant="solid" color={confirmColor} onClick={onConfirm}>
                            {confirm || (
                                <>
                                    <DoneIcon />
                                    <Label>Confirm</Label>
                                </>
                            )}
                        </Button>
                    </>
                )}
            </footer>
        </Dialog>
    );
});
