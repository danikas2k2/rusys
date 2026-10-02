import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { setProductParentAction } from '~/server/actions/products';

export function useSetProductParent(): (group: string, name: string, parent?: string) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, parent?: string): Promise<void> => {
            if (group && name) {
                await setProductParentAction(group, name, parent);
                await refresh();
            }
        },
        [refresh]
    );
}
