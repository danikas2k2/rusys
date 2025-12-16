import { ActionIcon, Button, Group, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { googleLogout } from '@react-oauth/google';
import { IconLogout } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { Label } from '~/client/common/Label';
import { useProfile } from '~/client/state/profile/useProfile';
import { useResetProfile } from '~/client/state/profile/useResetProfile';
import { ProfileAvatar } from '~/client/user/ProfileAvatar';

export function LogoutButton({ children }: React.PropsWithChildren): React.ReactElement {
    const [opened, { open, close }] = useDisclosure(false);

    const profile = useProfile();
    const resetProfile = useResetProfile();

    const handleConfirm = useCallback(() => {
        resetProfile();
        googleLogout();
    }, [resetProfile]);

    return (
        <>
            <ActionIcon variant="outline" size="lg" radius="xl" onClick={open}>
                {children || <ProfileAvatar />}
            </ActionIcon>

            <ConfirmationDialog
                opened={opened}
                title={<Label>Are you sure to logout?</Label>}
                confirmButton={
                    <Button leftSection={<IconLogout />}>
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
