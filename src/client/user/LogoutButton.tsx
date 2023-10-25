import CancelIcon from '@icons/Cancel.svg';
import LogoutIcon from '@icons/Logout.svg';
import { googleLogout } from '@react-oauth/google';
import { type ButtonProps } from '@ui/Button';
import ConfirmationDialog from '@ui/ConfirmationDialog';
import IconButton from '@ui/IconButton';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Label from '~/client/Label';
import ProfileAvatar from '~/client/user/ProfileAvatar';
import { resetProfileAction } from '~/store/profile/actions';

export default memo(function LogoutButton({ disabled, children }: ButtonProps) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const handleConfirm = useCallback(() => {
        setOpen(false);
        dispatch(resetProfileAction());
        googleLogout();
    }, [dispatch]);
    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);
    return (
        <>
            <IconButton className="edge-end size-small" onClick={handleOpen} disabled={disabled}>
                {children || <ProfileAvatar />}
            </IconButton>
            <ConfirmationDialog
                open={open}
                header={<Label>Sure to logout?</Label>}
                cancel={
                    <>
                        <CancelIcon />
                        <Label>Cancel</Label>
                    </>
                }
                confirm={
                    <>
                        <LogoutIcon />
                        <Label>Logout</Label>
                    </>
                }
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        </>
    );
}, isEqual);
