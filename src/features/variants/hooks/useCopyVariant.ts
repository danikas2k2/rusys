import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { CopyVariant } from '~/schema';
import { copyVariantAction } from '~/server/actions/variants';

export function useCopyVariant(): (request: CopyVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: CopyVariant): Promise<void> => {
            const { group, variant, targetGroup, targetVariant } = request;
            if (
                group &&
                variant &&
                targetGroup &&
                (group !== targetGroup || (targetVariant && variant !== targetVariant))
            ) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'copy', result: 'started' });
                try {
                    await copyVariantAction(request);
                    trackFaroEvent('data_action', { entity: 'variant', action: 'copy', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'copy', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
