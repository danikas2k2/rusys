import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { SetProductParent } from '~/schema';
import { setProductParentAction } from '~/server/actions/products';

export function useSetProductParent(): (request: SetProductParent) => Promise<void> {
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductParent): Promise<void> => {
            const { group, name } = request;
            if (group && name) {
                trackFaroEvent('data_action', { entity: 'product', action: 'set_parent', result: 'started' });
                try {
                    await setProductParentAction(request);
                    trackFaroEvent('data_action', { entity: 'product', action: 'set_parent', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'product', action: 'set_parent', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
