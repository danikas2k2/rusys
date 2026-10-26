import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { SetProductExpiryTolerance } from '~/schema';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

export function useSetProductExpiryTolerance(): (request: SetProductExpiryTolerance) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductExpiryTolerance): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'set_expiry_tolerance', result: 'started' });
                try {
                    await setProductExpiryToleranceAction(request);
                    trackFaroEvent('data_action', {
                        entity: 'product',
                        action: 'set_expiry_tolerance',
                        result: 'success',
                    });
                } catch (error) {
                    trackFaroEvent('data_action', {
                        entity: 'product',
                        action: 'set_expiry_tolerance',
                        result: 'error',
                    });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
