import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { reorderVariantsAction } from '~/server/actions/variants';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useReorderVariants(): (group: string, variants: Readonly<Record<string, number>>) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variants: Readonly<Record<string, number>>): Promise<void> => {
            if (group && !isEmpty(variants)) {
                await reorderVariantsAction(group, variants);
                await refresh();
            }
        },
        [refresh]
    );
}
