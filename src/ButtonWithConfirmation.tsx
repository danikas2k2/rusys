import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { ButtonProps } from '@mui/material/Button/Button';
import React, { MouseEvent, ReactNode, useState } from 'react';
import { Label } from '~/Label';
import '~/SliderActions.css';

interface ButtonWithConfirmationProps extends ButtonProps {
    confirm?: ReactNode;
    confirmButton?: ReactNode;
    declineButton?: ReactNode;
}

export function ButtonWithConfirmation({ confirm, confirmButton, declineButton, onClick, ...props }: ButtonWithConfirmationProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button {...props} onClick={handleOpen} />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{confirm || <Label>Confirm?</Label>}</DialogTitle>
                <DialogActions>
                    <Button variant="outlined" onClick={handleClose}>
                        {declineButton || <Label>Decline</Label>}
                    </Button>
                    <Button variant="contained" onClick={handleConfirm} autoFocus>
                        {confirmButton || <Label>Confirm</Label>}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
        handleClose();
        onClick?.(e);
    }
}
