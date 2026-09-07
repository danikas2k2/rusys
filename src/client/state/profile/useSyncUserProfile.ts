import type { ApiUpsertUserProfile } from '@rusys/common/api';
import { ApiV1 } from '@rusys/common/api/v1';
import type { UserProfile } from '@rusys/common/data';
import { useEffect, useRef } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useProfile } from '~/client/state/profile/useProfile';

// Refresh profile in DB if missing or stale
const STALE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function useSyncUserProfile(): void {
    const request = useApiRequest();
    const profile = useProfile();
    const lastKeyRef = useRef<string>('');
    const lastCheckedEmailRef = useRef<string>('');

    useEffect(() => {
        const email = profile?.email?.trim();
        if (!email) {
            return;
        }

        const payload: ApiUpsertUserProfile = {
            email,
            name: profile.name,
            picture: profile.picture,
        };

        const key = `${email}|${profile.name ?? ''}|${profile.picture ?? ''}`;

        // If local profile changed, always upsert (keeps cache up-to-date)
        if (key !== lastKeyRef.current) {
            lastKeyRef.current = key;
            void request(ApiV1.userProfile(email), { name: payload.name, picture: payload.picture }, 'PUT').catch(
                () => undefined
            );
            return;
        }

        // Otherwise, upsert only if server missing/stale (check once per email per session)
        const lowerEmail = email.toLowerCase();
        if (lowerEmail === lastCheckedEmailRef.current) {
            return;
        }
        lastCheckedEmailRef.current = lowerEmail;

        void (async () => {
            try {
                const result = await request<{ profiles?: readonly UserProfile[]; ok?: boolean }>(
                    ApiV1.userProfiles([email]),
                    'GET'
                );
                if ('ok' in result && !result.ok) {
                    return;
                }
                const existing = result.profiles?.find((p) => p.email?.toLowerCase() === lowerEmail);
                const updatedAt = existing?.updatedAt ?? 0;
                if (!existing || !updatedAt || Date.now() - updatedAt > STALE_MS) {
                    await request(ApiV1.userProfile(email), { name: payload.name, picture: payload.picture }, 'PUT');
                }
            } catch {
                // ignore
            }
        })();
    }, [profile.email, profile.name, profile.picture, request]);
}
