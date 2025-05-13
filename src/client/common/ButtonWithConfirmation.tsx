import React, { cloneElement, useCallback, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { Button, isButtonElement, type ButtonProps } from '@ui/Button';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';

interface ButtonWithConfirmationProps extends Omit<ButtonProps, 'title' | 'children'> {
    children?: ReactNode;
    dialogHeader?: ReactElement;
    confirmButton?: ReactElement<ButtonProps>;
    cancelButton?: ReactElement<ButtonProps>;
    onOpen?: () => void;
    onClose?: () => void;
}

export function ButtonWithConfirmation({
    dialogHeader,
    confirmButton,
    cancelButton,
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

    const button = isButtonElement(children) ? (
        children.type === 'button' ? (
            <Button onClick={handleOpen} {...props}>
                {children.props.children}
            </Button>
        ) : (
            cloneElement(children as ReactElement<ButtonProps>, {
                onClick: handleOpen,
                ...props,
            })
        )
    ) : (
        <Button onClick={handleOpen} {...props}>
            {children}
        </Button>
    );

    return (
        <>
            {button}
            <ConfirmationDialog
                open={open}
                header={dialogHeader}
                confirmButton={confirmButton ?? (children ? button : undefined)}
                cancelButton={cancelButton}
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        </>
    );
}
