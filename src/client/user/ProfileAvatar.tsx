import { Avatar, type AvatarProps } from '@mantine/core';
import { IconRobotFace } from '@tabler/icons-react';
import React from 'react';

import { DEV_MODE_SUB } from '~/client/state/profile/dev';
import { useProfile } from '~/client/state/profile/useProfile';

type ProfileAvatarProps = Pick<AvatarProps, 'size' | 'variant' | 'radius'>;

export function ProfileAvatar({ size = 'md', radius = '50%', variant }: ProfileAvatarProps) {
    const profile = useProfile();

    const name = profile?.name ?? [profile?.given_name ?? '', profile?.family_name ?? ''].filter((a) => !!a).join(' ');
    if (!name) {
        return null;
    }

    if (profile.picture) {
        return (
            <Avatar
                role="figure"
                src={profile.picture}
                alt={name}
                size={size}
                variant={variant}
                radius={radius}
                data-picture="true"
            />
        );
    }

    if (profile.dev || profile.sub === DEV_MODE_SUB) {
        return (
            <Avatar
                role="figure"
                color="cyan.9"
                size={size}
                variant={variant ?? 'outline'}
                radius={radius}
                data-robot="true"
            >
                <IconRobotFace size="60%" />
            </Avatar>
        );
    }

    return (
        <Avatar role="figure" aria-label={name} size={size} variant={variant} radius={radius} data-picture="false">
            {name
                .split(' ', 2)
                .map(([letter]) => letter)
                .join('')}
        </Avatar>
    );
}
