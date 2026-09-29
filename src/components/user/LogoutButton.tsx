import { ActionIcon, Button, Group, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import { ConfirmationDialogIcon, LogoutIcon } from '@icons';

import { ConfirmationDialog } from '~/components/common/ConfirmationDialog';
import { DialogIcon } from '~/components/common/DialogIcon';
import { Label } from '~/components/common/Label';
import { ProfileAvatar } from '~/components/user/ProfileAvatar';
import { useLabel } from '~/lib/hooks/useLabel';
import { logout } from '~/server/actions/auth';
import { useProfile } from '~/store/profile/useProfile';
import { useResetProfile } from '~/store/profile/useResetProfile';

export function LogoutButton({ children }: React.PropsWithChildren): React.ReactElement {
    const [opened, { open, close }] = useDisclosure(false);

    const profile = useProfile();
    const router = useRouter();
    const resetProfile = useResetProfile();

    const handleConfirm = useCallback(async () => {
        await logout();
        resetProfile();
        googleLogout();
        router.refresh();
    }, [resetProfile, router]);

    return (
        <>
            <ActionIcon variant="outline" size="lg" radius="xl" onClick={open} aria-label={useLabel('Logout')}>
                {children || <ProfileAvatar />}
            </ActionIcon>

            <ConfirmationDialog
                opened={opened}
                title={
                    <>
                        <DialogIcon>
                            <ConfirmationDialogIcon />
                        </DialogIcon>
                        <Label>Are you sure to logout?</Label>
                    </>
                }
                confirmButton={
                    <Button leftSection={<LogoutIcon />}>
                        <Label>Logout</Label>
                    </Button>
                }
                onConfirm={handleConfirm}
                onClose={close}
            >
                <Group wrap="nowrap" m="1.5rem" mb="3rem">
                    <ProfileAvatar size="5rem" />
                    <div>
                        <Title order={1} fz="xl" fw={500}>
                            {profile.name}
                        </Title>
                        <Text fz="xs" c="dimmed" mt={4}>
                            {profile.email}
                        </Text>
                    </div>
                </Group>
            </ConfirmationDialog>
        </>
    );
}
