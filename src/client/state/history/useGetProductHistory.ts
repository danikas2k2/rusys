import { ApiUrl } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetProductHistory(year: number, group?: string, name?: string): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(
        async (): Promise<void> => request(ApiUrl.ProductsHistory, { year, group, name }),
        [group, name, request, year]
    );
}
