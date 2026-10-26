import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { RenameVariant } from '~/schema';
import { renameVariantAction } from '~/server/actions/variants';

export function useRenameVariant(): (request: RenameVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: RenameVariant): Promise<void> => {
            const { group, variant, targetVariant } = request;
            if (group && variant && targetVariant && variant !== targetVariant) {
                trackFaroEvent('data_action', { entity: 'variant', action: 'rename', result: 'started' });
                try {
                    await renameVariantAction(request);
                    trackFaroEvent('data_action', { entity: 'variant', action: 'rename', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'variant', action: 'rename', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
