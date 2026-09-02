import { useCallback } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { ApiUrl } from '~/common/api';

export function useExport(): () => Promise<Blob> {
    const request = useApiRequest();
    return useCallback(async () => request<Blob>(ApiUrl.Export, undefined, undefined, 'blob'), [request]);
}
