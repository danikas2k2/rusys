import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { SetAmounts } from '~/schema';
import { setAmountsAction } from '~/server/actions/products';

export function useSetAmounts(): (request: SetAmounts) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetAmounts): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'stock', action: 'set_amounts', result: 'started' });
                try {
                    await setAmountsAction(request);
                    trackFaroEvent('data_action', { entity: 'stock', action: 'set_amounts', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'stock', action: 'set_amounts', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
