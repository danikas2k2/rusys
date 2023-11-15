import { useEffect } from 'react';
import { useClientIdLoader } from '~/state/google/useClientIdLoader';
import { useGoogle } from '~/state/google/useGoogle';

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
