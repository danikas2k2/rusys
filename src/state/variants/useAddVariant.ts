import { useCallback } from 'react';
import { type UpdateVariant } from '~/common/types';
import { useUpdateVariant } from '~/state/variants/useUpdateVariant';

export function useAddVariant(): (group: string, variant: string, update?: UpdateVariant) => Promise<void> {
    const updateVariant = useUpdateVariant();
    return useCallback(
        async (group: string, variant: string, update: UpdateVariant = {}): Promise<void> =>
            updateVariant(group, variant, update),
        [updateVariant]
    );
}
