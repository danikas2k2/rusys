import { createSelector } from '@reduxjs/toolkit';
import type { Variant } from '@rusys/common/data';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/store/variants/types';

export const useAllVariants = (group: string): string[] => {
    // A dedicated selector instance per (component, group) — createSelector's cache is a single
    // slot, so sharing one instance across many components/groups would thrash on every render.
    const selectVariantsForGroup = useMemo(
        () =>
            createSelector(
                (state: WithVariantsState) => state.variants,
                (variants: readonly Variant[] | undefined) =>
                    variants
                        ?.filter((v) => v.group === group)
                        .sort((a, b) => a.order - b.order)
                        .map((v) => v.variant) ?? []
            ),
        [group]
    );
    return useSelector(selectVariantsForGroup);
};
