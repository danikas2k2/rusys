import { Button, type ButtonProps } from '@ui/Button';
import { type ReactNodeOrFunction } from '@ui/utils/renderElement';
import React, { type ReactNode, useCallback, useState } from 'react';
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

    const button =
        typeof children === 'function' ? (
            children?.({ ...props, onClick: handleOpen })
        ) : children ? (
            <Button onClick={handleOpen} {...props}>
                {children}
            </Button>
        ) : undefined;

    return (
        <>
            {button ?? <Button onClick={handleOpen} {...props} />}
            <ConfirmationDialog
                open={open}
                header={dialogHeader}
                confirmButton={confirmButton ?? button}
                confirmProps={confirmProps}
                cancelButton={cancelButton}
                cancelProps={cancelProps}
                onConfirm={(e) => {
                    handleClose();
                    onClick?.(e);
                }}
                onClose={handleClose}
            />
        </>
    );
}
