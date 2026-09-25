import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useApiRequest } from '~/store/common/useApiRequest';

export function useExport(): () => Promise<Blob> {
    const request = useApiRequest();
    return useCallback(async () => request<Blob>(API.exportLatest(), undefined, 'GET', 'blob'), [request]);
}
