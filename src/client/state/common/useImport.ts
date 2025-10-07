import { useCallback } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { ApiUrl, type ApiResult } from '~/types/api';

export function useImport(): (data: FormData) => Promise<ApiResult<boolean>> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<ApiResult<boolean>> => request(ApiUrl.Import, data), [request]);
}
