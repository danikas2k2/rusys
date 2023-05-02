import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import useClientIdLoader from '~/store/google/useClientIdLoader';

export default function useClientId(): string | undefined {
    const clientId = useSelector((state: BaseState) => state.google?.clientId);
    const loadClientId = useClientIdLoader();
    useEffect(() => {
        if (!clientId) {
            (async () => {
                await loadClientId();
            })();
        }
    }, [clientId, loadClientId]);
    return clientId;
}
