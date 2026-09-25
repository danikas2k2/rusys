import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useApiRequest } from '~/store/common/useApiRequest';

export function useImport(): (data: FormData) => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<void> => request(API.import(), data, 'POST'), [request]);
}
