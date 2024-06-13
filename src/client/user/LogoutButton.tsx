import LogoutIcon from '@icons/Logout.svg';
import { googleLogout } from '@react-oauth/google';
import { Button, type ButtonProps } from '@ui/Button';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { IconButton } from '@ui/IconButton';
import React, { useCallback } from 'react';
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
            {(innerProps) => (
                <IconButton size="small" {...innerProps}>
                    {children || <ProfileAvatar />}
                </IconButton>
            )}
        </ButtonWithConfirmation>
    );
}
