import CancelIcon from '@icons/Cancel.svg';
import LogoutIcon from '@icons/Logout.svg';
import { googleLogout } from '@react-oauth/google';
import { type ButtonProps } from '@ui/Button';
import ButtonWithConfirmation from '@ui/ButtonWithConfirmation';
import IconButton from '@ui/IconButton';
import { isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import Label from '~/client/Label';
import ProfileAvatar from '~/client/user/ProfileAvatar';
import { useResetProfile } from '~/state/profile/useResetProfile';

export default memo(function LogoutButton({ children, ...props }: ButtonProps) {
    const resetProfile = useResetProfile();
    const handleConfirm = useCallback(() => {
        resetProfile();
        googleLogout();
    }, [resetProfile]);
    return (
        <ButtonWithConfirmation
            {...props}
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
            onClick={handleConfirm}
        >
            {(props) => (
                <IconButton className="edge-end size-small" {...props}>
                    {children || <ProfileAvatar />}
                </IconButton>
            )}
        </ButtonWithConfirmation>
    );
}, isEqual);
