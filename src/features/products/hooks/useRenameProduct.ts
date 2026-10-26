import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { RenameProduct } from '~/schema';
import { renameProductAction } from '~/server/actions/products';

export function useRenameProduct(): (request: RenameProduct) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: RenameProduct): Promise<void> => {
            const { group, name, targetName } = request;
            if (group && name && targetName && name !== targetName) {
                trackFaroEvent('data_action', { entity: 'product', action: 'rename', result: 'started' });
                try {
                    await renameProductAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'rename', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'rename', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
