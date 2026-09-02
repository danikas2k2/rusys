import { createSelector } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/client/state/variants/types';
import type { Variant } from '~/common/data';

export const useVariantsByGroup = (group: string): readonly Variant[] => {
    // A dedicated selector instance per (component, group) — createSelector's cache is a single
    // slot, so sharing one instance across many components/groups would thrash on every render.
    const selectVariantsForGroup = useMemo(
        () =>
            createSelector(
                (state: WithVariantsState) => state.variants,
                (variants: readonly Variant[] | undefined) => variants?.filter((v) => v.group === group) ?? []
            ),
        [group]
    );
    return useSelector(selectVariantsForGroup);
};
