import { useEffect } from 'react';

import { useGoogle } from '~/client/state/google/useGoogle';
import { useGoogleClientIdLoader } from '~/client/state/google/useGoogleClientIdLoader';

export function useGoogleClientId(): string {
    const clientId = useGoogle().clientId ?? '';
    const loadClientId = useGoogleClientIdLoader();
    useEffect(() => {
        if (!clientId) {
            (async () => await loadClientId())();
        }
    }, [clientId, loadClientId]);
    return clientId;
}
