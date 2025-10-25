import React, { useCallback } from 'react';

import { ActionIcon, Button } from '@mantine/core';
import { googleLogout } from '@react-oauth/google';
import { IconLogout } from '@tabler/icons-react';

import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { type ButtonElementProps } from '~/client/common/ConfirmationDialog';
import { Label } from '~/client/common/Label';
import { useResetProfile } from '~/client/state/profile/useResetProfile';
import { ProfileAvatar } from '~/client/user/ProfileAvatar';

export function LogoutButton({ children, ...props }: ButtonElementProps) {
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
                <Button leftSection={<IconLogout />}>
                    <Label>Logout</Label>
                </Button>
            }
            onClick={handleConfirm}
        >
            <ActionIcon variant="light" size="lg" radius="xl">
                {children || <ProfileAvatar />}
            </ActionIcon>
        </ButtonWithConfirmation>
    );
}
