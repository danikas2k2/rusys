import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useIdentity } from '~/components/app/IdentityContext';

export function useResetProfile(): () => void {
    const { setProfile } = useIdentity();
    const client = useQueryClient();
    return useCallback(() => {
        client.clear();
        setProfile({});
    }, [client, setProfile]);
}
