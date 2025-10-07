import { useCallback } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { ApiUrl, type ApiExport, type ApiResult } from '~/types/api';

export function useExport() {
    const request = useApiRequest();
    return useCallback(async () => request<ApiResult<ApiExport>>(ApiUrl.Export), [request]);
}
