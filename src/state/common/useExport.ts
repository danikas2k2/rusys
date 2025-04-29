import { useCallback } from 'react';
import { ApiUrl, type ApiExport, type ApiResult } from '~/common/api';
import { useApiRequest } from '~/common/hooks/useApiRequest';

export function useExport() {
    const request = useApiRequest();
    return useCallback(async () => request<ApiResult<ApiExport>>(ApiUrl.Export), [request]);
}
