import { ApiUrl, type ApiSetVariantImage } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

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
