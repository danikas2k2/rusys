import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useApiRequest } from '~/store/common/useApiRequest';

export function useImport(): (data: FormData) => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<void> => request(API.import(), data, 'POST'), [request]);
}
