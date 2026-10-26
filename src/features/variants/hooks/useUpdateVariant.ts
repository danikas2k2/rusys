import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { UpdateVariant } from '~/schema';
import { updateVariantAction } from '~/server/actions/variants';

export function useUpdateVariant(): (request: UpdateVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: UpdateVariant): Promise<void> => {
            const { group, variant } = request;
            if (group && variant) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'update', result: 'started' });
                try {
                    await updateVariantAction(request);
                    trackFaroEvent('data_action', { entity: 'variant', action: 'update', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'update', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
