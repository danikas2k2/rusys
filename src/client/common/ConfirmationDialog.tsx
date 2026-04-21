import { Alert, Button, Group, Modal, type ButtonProps, type ModalProps } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import React, { cloneElement, useCallback, useState } from 'react';

import { Label } from '~/client/common/Label';
import { getErrorMessage } from '~/client/utils/errors';

export type ButtonElementProps = ButtonProps &
    React.AriaAttributes &
    Omit<React.DOMAttributes<HTMLButtonElement>, 'onClick'> & {
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    };
export type ButtonElement = React.ReactElement<ButtonElementProps>;

export interface ConfirmationDialogProps extends Omit<ModalProps, 'onClose'> {
    actions?: React.ReactElement;
    confirmButton?: ButtonElement;
    cancelButton?: ButtonElement;
    onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    /** Called with the click event from Cancel; without args from Modal chrome / after confirm */
    onClose?: (event?: React.SyntheticEvent) => void;
    closeLabel?: string;
}

export const confirmButtonProps: ButtonProps = {
    variant: 'solid',
    color: 'primary',
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = useCallback(
        (e?: React.SyntheticEvent) => {
            setError(null);
            if (e !== undefined) {
                onClose?.(e);
            } else {
                onClose?.();
            }
        },
        [onClose]
    );

    const handleConfirm = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            // Clear previous error
            setError(null);

            // Delay loading state to avoid showing it for fast operations
            const loadingTimeout = setTimeout(() => {
                setLoading(true);
            }, 300);

            try {
                await onConfirm?.(e);
                handleClose();
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                clearTimeout(loadingTimeout);
                setLoading(false);
            }
        },
        [onConfirm, handleClose]
    );

    return (
        <Modal
            role="alertdialog"
            size="auto"
            closeOnEscape={!loading}
            closeOnClickOutside={!loading}
            centered
            opened={opened}
            onClose={handleClose}
            closeButtonProps={{
                'aria-label': closeLabel,
                disabled: loading,
                ...closeButtonProps,
            }}
            title={title}
            {...props}
        >
            {children}
            {opened && error && (
                <Alert variant="light" color="negative" icon={<IconAlertCircle size={18} />} mt="md">
                    {error}
                </Alert>
            )}
            {actions || (
                <Group justify="right" mt="md">
                    {cancelButton ? (
                        cloneElement(cancelButton, {
                            ...cancelButtonProps,
                            ...cancelButton.props,
                            onClick: handleClose,
                            disabled: loading,
                        })
                    ) : (
                        <Button {...cancelButtonProps} onClick={handleClose} disabled={loading} />
                    )}
                    {confirmButton ? (
                        cloneElement(confirmButton, {
                            ...confirmButtonProps,
                            ...confirmButton.props,
                            onClick: handleConfirm,
                            loading,
                        })
                    ) : (
                        <Button {...confirmButtonProps} onClick={handleConfirm} loading={loading} />
                    )}
                </Group>
            )}
        </Modal>
    );
}
