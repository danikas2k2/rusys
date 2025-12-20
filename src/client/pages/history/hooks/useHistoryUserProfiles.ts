import { useEffect, useMemo, useState } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { UserProfile } from '~/types/data';

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

export function useHistoryUserProfiles(emails: readonly string[]): Record<string, UserProfile> {
    const request = useApiRequest();
    const [profilesByEmail, setProfilesByEmail] = useState<Record<string, UserProfile>>({});

    const uniqueEmails = useMemo(() => {
        const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
        unique.sort();
        return unique;
    }, [emails]);

    useEffect(() => {
        if (!uniqueEmails.length) {
            setProfilesByEmail({});
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const result = await request<ApiResult<{ profiles: readonly UserProfile[] }>>(ApiUrl.UserProfiles, {
                    emails: uniqueEmails,
                });
                assertOk(result);

                const next: Record<string, UserProfile> = {};
                for (const p of result.profiles ?? []) {
                    if (p.email) {
                        next[p.email.toLowerCase()] = p;
                    }
                }

                if (!cancelled) {
                    setProfilesByEmail(next);
                }
            } catch {
                // If profiles endpoint is unavailable, just fall back to initials/robot/gravatar
                if (!cancelled) {
                    setProfilesByEmail({});
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [request, uniqueEmails]);

    return profilesByEmail;
}


