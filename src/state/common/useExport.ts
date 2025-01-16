import { useCallback } from 'react';
import { ApiUrl } from '~/common/api';
import { useApiRequest } from '~/common/hooks/useApiRequest';

export function useExport(): () => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (): Promise<void> => request(ApiUrl.Export), [request]);
}
