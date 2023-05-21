import ConfirmationDialog from '@ui/ConfirmationDialog';
import { type InputColor } from '@ui/Input';
import React, { type JSX, memo, type ReactNode, useState } from 'react';
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
}: ButtonWithConfirmationProps): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)} {...props} />
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
                onClose={() => setOpen(false)}
            />
        </>
    );
});
