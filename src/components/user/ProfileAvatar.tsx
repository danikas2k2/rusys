import type { AvatarProps } from '@mantine/core';
import React from 'react';

import { DevUserIcon } from '@icons';

import { Thumbnail } from '~/components/common/Thumbnail';
import { DEV_MODE_SUB, useProfile } from '~/store/profile';

type ProfileAvatarProps = Pick<AvatarProps, 'size' | 'variant' | 'radius'>;

export function ProfileAvatar({ size = 'md', radius = '50%', variant }: ProfileAvatarProps) {
    const profile = useProfile();

    const name = profile?.name ?? [profile?.given_name ?? '', profile?.family_name ?? ''].filter((a) => !!a).join(' ');
    if (!name) {
        return null;
    }
    const initials = name
        .split(' ', 2)
        .map(([letter]) => letter)
        .join('');

    if (profile.picture) {
        return (
            <Thumbnail
                role="figure"
                src={profile.picture}
                alt={name}
                fallback={initials}
                size={size}
                variant={variant}
                radius={radius}
                data-picture="true"
            />
        );
    }

    if (profile.dev || profile.sub === DEV_MODE_SUB) {
        return (
            <Thumbnail
                role="figure"
                alt={name}
                fallback={<DevUserIcon size="60%" />}
                color="cyan.9"
                size={size}
                variant={variant ?? 'outline'}
                radius={radius}
                data-robot="true"
            />
        );
    }

    return (
        <Thumbnail
            role="figure"
            alt={name}
            fallback={initials}
            aria-label={name}
            size={size}
            variant={variant}
            radius={radius}
            data-picture="false"
        />
    );
}
