import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { setVariantImageAction } from '~/server/actions/products';

export function useSetVariantImage(): (group: string, name: string, variant: string, image: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, variant: string, image: string): Promise<void> => {
            if (group && name && variant) {
                await setVariantImageAction(group, name, variant, image);
                await refresh();
            }
        },
        [refresh]
    );
}
