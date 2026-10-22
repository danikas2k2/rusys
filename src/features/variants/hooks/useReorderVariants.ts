import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import type { ReorderVariants } from '~/schema';
import { reorderVariantsAction } from '~/server/actions/variants';

export function useReorderVariants(): (request: ReorderVariants) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: ReorderVariants): Promise<void> => {
            const { group, variants } = request;
            if (group && !isEmpty(variants)) {
                await reorderVariantsAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
