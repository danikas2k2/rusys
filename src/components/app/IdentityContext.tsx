'use client';

import React, { createContext, use, useMemo, useState } from 'react';

import type { Profile } from '~/store/profile/types';

interface Identity {
    clientId: string;
    profile: Profile;
    setProfile: (profile: Profile) => void;
}

const IdentityContext = createContext<Identity | null>(null);
const EMPTY_PROFILE: Profile = {};

export function IdentityProvider({
    clientId = '',
    initialProfile = EMPTY_PROFILE,
    children,
}: React.PropsWithChildren<{ clientId?: string; initialProfile?: Profile }>) {
    const [profile, setProfile] = useState(initialProfile);
    const value = useMemo(() => ({ clientId, profile, setProfile }), [clientId, profile]);
    return <IdentityContext value={value}>{children}</IdentityContext>;
}

export function useIdentity(): Identity {
    const identity = use(IdentityContext);
    if (!identity) {
        throw new Error('IdentityProvider is required');
    }
    return identity;
}
