import CancelIcon from '@icons/Cancel.svg';
import LogoutIcon from '@icons/Logout.svg';
import { googleLogout } from '@react-oauth/google';
import { type ButtonProps } from '@ui/Button';
import ConfirmationDialog from '@ui/ConfirmationDialog';
import IconButton from '@ui/IconButton';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Label from '~/client/Label';
import ProfileAvatar from '~/client/user/ProfileAvatar';
import { resetProfileAction } from '~/store/profile/actions';

export default function LogoutButton({ disabled, children }: ButtonProps): JSX.Element {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const onConfirm = useCallback((): void => {
        setOpen(false);
        dispatch(resetProfileAction());
        googleLogout();
    }, [dispatch]);
    return (
        <>
            <IconButton className="edge-end size-small" onClick={() => setOpen(true)} disabled={disabled}>
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
                onConfirm={onConfirm}
                onClose={() => setOpen(false)}
            />
        </>
    );
}
