import { useCallback } from 'react';
import { ApiUrl } from '~/common/api';
import { useApiRequest } from '~/common/hooks/useApiRequest';

export function useImport(): (data: FormData) => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<void> => request(ApiUrl.Import, data), [request]);
}
