import { useCallback } from 'react';

import { API } from '~/common/api/v1';
import { useApiRequest } from '~/store/common/useApiRequest';

export function useExport(): () => Promise<Blob> {
    const request = useApiRequest();
    return useCallback(async () => request<Blob>(API.exportLatest(), undefined, 'GET', 'blob'), [request]);
}
