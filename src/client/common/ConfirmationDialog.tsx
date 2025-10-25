import React, {
    cloneElement,
    type AriaAttributes,
    type DOMAttributes,
    type MouseEvent,
    type ReactElement,
} from 'react';

import { Button, Group, Modal, type ButtonProps, type ModalProps } from '@mantine/core';
import { IconCancel, IconCheck, IconChecks, IconX } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';

export type ButtonElementProps = ButtonProps & AriaAttributes & DOMAttributes<HTMLButtonElement>;
export type ButtonElement = ReactElement<ButtonElementProps>;

export interface ConfirmationDialogProps extends ModalProps {
    actions?: ReactElement;
    confirmButton?: ButtonElement;
    cancelButton?: ButtonElement;
    onConfirm: (e: MouseEvent<HTMLButtonElement>) => void;
    closeLabel?: string;
}

export const confirmButtonProps: ButtonProps = {
    variant: 'solid',
    color: 'blue',
    leftSection: <IconCheck size={18} />,
    children: <Label>Confirm</Label>,
};

export const cancelButtonProps: ButtonProps = {
    variant: 'outline',
    color: 'gray',
    leftSection: <IconX size={18} />,
    children: <Label>Cancel</Label>,
};

export function ConfirmationDialog({
    title = <Label>Are you sure?</Label>,
    actions,
    confirmButton,
    cancelButton,
    opened = false,
    onConfirm,
    onClose,
    closeLabel = 'Close',
    children,
    closeButtonProps,
    ...props
}: ConfirmationDialogProps) {
    return (
        <Modal
            role="alertdialog"
            size="auto"
            closeOnEscape
            closeOnClickOutside
            centered
            opened={opened}
            onClose={onClose}
            closeButtonProps={{
                content: closeLabel,
                ...closeButtonProps,
            }}
            title={title}
            {...props}
        >
            {children}
            {actions || (
                <Group justify="center">
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
                </Group>
            )}
        </Modal>
    );
}
