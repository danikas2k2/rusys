import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { SetAmounts } from '~/schema';
import { setAmountsAction, setAmountsBatchAction } from '~/server/actions/products';

export function useSetAmounts(): (request: SetAmounts | SetAmounts[]) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetAmounts | SetAmounts[]): Promise<void> => {
            const requests = Array.isArray(request) ? request : [request];
            const { group, name } = requests[0] ?? {};
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'stock', action: 'set_amounts', result: 'started' });
                try {
                    if (requests.length === 1) {
                        await setAmountsAction(requests[0]);
                    } else {
                        await setAmountsBatchAction(requests);
                    }
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
