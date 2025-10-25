import React from 'react';

import { Avatar } from '@mantine/core';
import { IconRobotFace } from '@tabler/icons-react';

import { DEV_MODE_SUB } from '~/client/state/profile/dev';
import { useProfile } from '~/client/state/profile/useProfile';

export function ProfileAvatar() {
    const profile = useProfile();
    const name = profile?.name ?? [profile?.given_name ?? '', profile?.family_name ?? ''].filter(Boolean).join(' ');
    if (!name) {
        return null;
    }
    return profile.picture ? (
        <Avatar src={profile.picture} alt={name} />
    ) : profile.dev || profile.sub === DEV_MODE_SUB ? (
        <Avatar color="blue" radius="xl" size="md">
            <IconRobotFace />
        </Avatar>
    ) : (
        <Avatar radius="xl" aria-label={name}>
            {name
                .split(' ', 2)
                .map(([letter]) => letter)
                .join('')}
        </Avatar>
    );
}
