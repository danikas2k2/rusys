import { Avatar } from '@mantine/core';
import React from 'react';

import { AnonymousUserIcon, DevUserIcon } from '@icons';

import type { UserProfile } from '~/common/data';
import { gravatarUrl } from '~/lib/utils/gravatar';
import { DEV_MODE_EMAIL } from '~/store/profile/dev';

export function EmailAvatar({
    email,
    profile,
    fallbackPicture,
}: {
    email?: string;
    profile?: UserProfile;
    fallbackPicture?: string;
}): React.ReactElement | null {
    if (!email) {
        return (
            <Avatar color="gray" variant="outline" radius="50%" size="sm" data-anonymous="true">
                <AnonymousUserIcon size="60%" />
            </Avatar>
        );
    }
    const initials = email
        .split('@', 1)[0]
        .split(/[.\-_ ]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join('');
    if (email.toLowerCase() === DEV_MODE_EMAIL.toLowerCase()) {
        return (
            <Avatar color="cyan.9" variant="outline" radius="50%" size="sm" data-robot="true">
                <DevUserIcon size="60%" />
            </Avatar>
        );
    }
    return (
        <Avatar
            radius="50%"
            size="sm"
            src={profile?.picture || fallbackPicture || gravatarUrl(email)}
            alt={profile?.name ?? email}
            title={email}
            aria-label={email}
        >
            {initials || email[0]!.toUpperCase()}
        </Avatar>
    );
}
