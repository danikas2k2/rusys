import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';

export function useImport(): (data: FormData) => Promise<void> {
    const request = useApiRequest();
    return useCallback(async (data: FormData): Promise<void> => request(ApiV1.import, data, 'POST'), [request]);
}
