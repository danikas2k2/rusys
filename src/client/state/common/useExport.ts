import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';

export function useExport(): () => Promise<Blob> {
    const request = useApiRequest();
    return useCallback(async () => request<Blob>(ApiV1.exportLatest, undefined, 'GET', 'blob'), [request]);
}
