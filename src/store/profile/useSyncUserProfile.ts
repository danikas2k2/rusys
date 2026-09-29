import { startTransition, useEffect, useRef } from 'react';

import { syncUserProfile } from '~/server/actions/syncUserProfile';
import { useProfile } from '~/store/profile/useProfile';

export function useSyncUserProfile(): void {
    const profile = useProfile();
    const lastKeyRef = useRef('');

    useEffect(() => {
        const email = profile.email?.trim();
        if (!profile.sub || !email) {
            return;
        }

        const key = `${email}|${profile.name ?? ''}|${profile.picture ?? ''}`;
        if (key === lastKeyRef.current) {
            return;
        }
        lastKeyRef.current = key;

        startTransition(() => {
            void syncUserProfile({ email, name: profile.name, picture: profile.picture }).catch(() => {
                if (lastKeyRef.current === key) {
                    lastKeyRef.current = '';
                }
            });
        });
    }, [profile.email, profile.name, profile.picture, profile.sub]);
}
