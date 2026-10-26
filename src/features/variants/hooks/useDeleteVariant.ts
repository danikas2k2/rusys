import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { DeleteVariant } from '~/schema';
import { deleteVariantAction } from '~/server/actions/variants';

export function useDeleteVariant(): (request: DeleteVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: DeleteVariant): Promise<void> => {
            const { group, variant } = request;
            if (group && variant) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'delete', result: 'started' });
                try {
                    await deleteVariantAction(request);
                    trackFaroEvent('data_action', { entity: 'variant', action: 'delete', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'delete', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
