import ConfirmationDialog from '@ui/ConfirmationDialog';
import { type InputColor } from '@ui/Input';
import { isEqual } from 'lodash';
import React, { memo, type ReactNode, useCallback, useState } from 'react';
import Button, { type ButtonProps } from '~/ui/Button';

interface ButtonWithConfirmationProps extends Omit<ButtonProps, 'title'> {
    header?: ReactNode;
    confirm?: ReactNode;
    confirmColor?: InputColor;
    cancel?: ReactNode;
}

export default memo(function ButtonWithConfirmation({
    header,
    confirm,
    confirmColor,
    cancel,
    onClick,
    ...props
}: ButtonWithConfirmationProps) {
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
        <>
            <Button onClick={handleOpen} {...props} />
            <ConfirmationDialog
                open={open}
                header={header}
                confirm={confirm}
                confirmColor={confirmColor}
                cancel={cancel}
                onConfirm={(e) => {
                    setOpen(false);
                    onClick?.(e);
                }}
                onClose={handleClose}
            />
        </>
    );
}, isEqual);
