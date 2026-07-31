import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { ApiUrl, type ApiSetVariantImage } from '~/types/api';

export function useSetVariantImage(): (group: string, name: string, variant: string, image: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiSetVariantImage>();
    return useCallback(
        async (group: string, name: string, variant: string, image: string): Promise<void> => {
            if (group && name && variant) {
                return request(ApiUrl.ProductsSetVariantImage, { group, name, variant, image });
            }
        },
        [request]
    );
}
