import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { deleteVariantAction } from '~/server/actions/variants';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            if (group && variant) {
                await deleteVariantAction(group, variant);
                await refresh();
            }
        },
        [refresh]
    );
}
