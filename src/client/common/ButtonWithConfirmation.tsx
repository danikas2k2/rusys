import { type ButtonProps } from '@ui/Button';
import { type ReactNodeOrFunction, renderElement } from '@ui/utils/renderElement';
import React, { type MouseEvent, type ReactNode, useCallback, useState } from 'react';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';

interface ButtonWithConfirmationProps extends Omit<ButtonProps, 'title' | 'children'> {
    children?: ReactNodeOrFunction<ButtonProps>;
    dialogHeader?: ReactNode;
    confirmButton?: ReactNodeOrFunction<ButtonProps>;
    confirmProps?: ButtonProps;
    cancelButton?: ReactNodeOrFunction<ButtonProps>;
    cancelProps?: ButtonProps;
    onOpen?: () => void;
    onClose?: () => void;
}

export function ButtonWithConfirmation({
    dialogHeader,
    confirmButton,
    confirmProps,
    cancelButton,
    cancelProps,
    onClick,
    onOpen,
    onClose,
    children,
    ...props
}: ButtonWithConfirmationProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
        onOpen?.();
    }, [onOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
        onClose?.();
    }, [onClose]);

    const handleConfirm = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            handleClose();
            onClick?.(e);
        },
        [handleClose, onClick]
    );

    const button = renderElement(children, { onClick: handleOpen }, props);
    return (
        <>
            {button}
            <ConfirmationDialog
                open={open}
                header={dialogHeader}
                confirmButton={confirmButton ?? button}
                confirmProps={confirmProps}
                cancelButton={cancelButton}
                cancelProps={cancelProps}
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        </>
    );
}
