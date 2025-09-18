import LogoutIcon from '@assets/logout.svg';

import React, { useCallback } from 'react';

import { googleLogout } from '@react-oauth/google';

import { Button, IconButton, type ButtonProps } from '@ui/Button';

import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Label } from '~/client/common/Label';
import { ProfileAvatar } from '~/client/user/ProfileAvatar';
import { useResetProfile } from '~/state/profile/useResetProfile';

export function LogoutButton({ children, ...props }: ButtonProps) {
    const resetProfile = useResetProfile();
    const handleConfirm = useCallback(() => {
        resetProfile();
        googleLogout();
    }, [resetProfile]);
    return (
        <ButtonWithConfirmation
            {...props}
            dialogHeader={<Label>Sure to logout?</Label>}
            confirmButton={
                <Button startDecorator={<LogoutIcon />}>
                    <Label>Logout</Label>
                </Button>
            }
            onClick={handleConfirm}
        >
            <IconButton size="small">{children || <ProfileAvatar />}</IconButton>
        </ButtonWithConfirmation>
    );
}
