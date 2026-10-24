import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import type { RenameProduct } from '~/schema';
import { renameProductAction } from '~/server/actions/products';

export function useRenameProduct(): (request: RenameProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: RenameProduct): Promise<void> => {
            const { group, name, targetName } = request;
            if (group && name && targetName && name !== targetName) {
                await renameProductAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
