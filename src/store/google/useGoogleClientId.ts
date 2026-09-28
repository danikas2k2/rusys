import { useEffect } from 'react';

import { useGoogle } from '~/store/google/useGoogle';
import { useGoogleClientIdLoader } from '~/store/google/useGoogleClientIdLoader';

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
