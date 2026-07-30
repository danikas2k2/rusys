import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetImage } from '~/types/api';

export function useSetProductImage(): (group: string, name: string, image: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetImage>();
    return useCallback(
        async (group: string, name: string, image: string): Promise<void> => {
            if (group && name) {
                return request(ApiUrl.ProductsSetImage, { group, name, image });
            }
        },
        [request]
    );
}
