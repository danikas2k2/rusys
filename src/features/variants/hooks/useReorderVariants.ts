import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { ReorderVariants } from '~/schema';
import { reorderVariantsAction } from '~/server/actions/variants';

export function useReorderVariants(): (request: ReorderVariants) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: ReorderVariants): Promise<void> => {
            const { group, variants } = request;
            if (group && !isEmpty(variants)) {
                try {
                    await reorderVariantsAction(request);
                    trackFaroEvent('list_reordered', { list: 'variants', result: 'success' });
                } catch (error) {
                    trackFaroEvent('list_reordered', { list: 'variants', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
