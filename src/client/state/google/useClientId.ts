import { useEffect } from 'react';

import { useClientIdLoader } from '~/client/state/google/useClientIdLoader';
import { useGoogle } from '~/client/state/google/useGoogle';

export function useClientId(): string | undefined {
    const clientId = useGoogle().clientId;
    const loadClientId = useClientIdLoader();
    useEffect(() => {
        if (!clientId) {
            (async () => await loadClientId())();
        }
    }, [clientId, loadClientId]);
    return clientId;
}
