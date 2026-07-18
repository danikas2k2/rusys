import { Avatar } from '@mantine/core';
import { IconRobotFace } from '@tabler/icons-react';
import React from 'react';

import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { gravatarUrl } from '~/client/utils/gravatar';
import type { UserProfile } from '~/types/data';

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
        return null;
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
                <IconRobotFace size="60%" />
            </Avatar>
        );
    }

    const src = profile?.picture || fallbackPicture || gravatarUrl(email);

    // If the image fails to load (CSP/network), Mantine will render children as fallback.
    return (
        <Avatar radius="50%" size="sm" src={src} alt={profile?.name ?? email} title={email} aria-label={email}>
            {initials || email[0]!.toUpperCase()}
        </Avatar>
    );
}
