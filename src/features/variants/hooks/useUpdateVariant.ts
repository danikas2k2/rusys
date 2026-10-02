import { useCallback } from 'react';

import type { UpdateVariant } from '~/common/data';
import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { saveVariant } from '~/server/actions/variants';

export function useUpdateVariant(): (group: string, variant: string, update: UpdateVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant): Promise<void> => {
            if (group && variant) {
                await saveVariant(group, variant, update);
                await refresh();
            }
        },
        [refresh]
    );
}
