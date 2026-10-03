import React from 'react';

import { AnonymousUserIcon, DevUserIcon } from '@icons';

import type { UserProfile } from '~/common/data';
import { Thumbnail } from '~/components/common/Thumbnail';
import { gravatarUrl } from '~/lib/utils/gravatar';
import { DEV_MODE_EMAIL } from '~/store/profile';

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
            <Thumbnail
                alt=""
                fallback={<AnonymousUserIcon size="60%" />}
                color="gray"
                variant="outline"
                radius="50%"
                size="sm"
                data-anonymous="true"
            />
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
            <Thumbnail
                alt=""
                fallback={<DevUserIcon size="60%" />}
                color="cyan.9"
                variant="outline"
                radius="50%"
                size="sm"
                data-robot="true"
            />
        );
    }
    return (
        <Thumbnail
            radius="50%"
            size="sm"
            src={profile?.picture || fallbackPicture || gravatarUrl(email)}
            alt={profile?.name ?? email}
            fallback={initials || email[0]!.toUpperCase()}
            title={email}
            aria-label={email}
        />
    );
}
