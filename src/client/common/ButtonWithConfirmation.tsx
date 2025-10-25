import React, { cloneElement, useCallback, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { isButtonElement } from '@ui/Button';

import { ConfirmationDialog, type ButtonElement, type ButtonElementProps } from '~/client/common/ConfirmationDialog';

interface ButtonWithConfirmationProps extends Omit<ButtonElementProps, 'title' | 'children'> {
    children?: ReactNode;
    dialogHeader?: ReactElement;
    confirmButton?: ButtonElement;
    cancelButton?: ButtonElement;
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
    const [opened, { open, close }] = useDisclosure(false);

    const handleOpen = useCallback(() => {
        open();
        onOpen?.();
    }, [onOpen, open]);

    const handleClose = useCallback(() => {
        close();
        onClose?.();
    }, [close, onClose]);

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
            cloneElement(children as ButtonElement, {
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
                opened={opened}
                title={dialogHeader}
                confirmButton={confirmButton ?? (children ? button : undefined)}
                cancelButton={cancelButton}
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        </>
    );
}
