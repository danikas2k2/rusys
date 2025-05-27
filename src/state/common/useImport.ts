import { useCallback } from 'react';
import { useApiRequest } from '~/common/hooks/useApiRequest';
import { ApiUrl } from '~/types/api';

export function useImport(): (data: FormData) => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<void> => request(ApiUrl.Import, data), [request]);
}
