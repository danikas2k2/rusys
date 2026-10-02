import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/store/variants/types';

const selectVariantsForGroup = createSelector(
    [(state: WithVariantsState) => state.variants, (_state: WithVariantsState, group: string) => group],
    (variants, group) =>
        variants
            ?.filter((variant) => variant.group === group)
            .sort((a, b) => a.order - b.order)
            .map((variant) => variant.variant) ?? []
);

export const useAllVariants = (group: string): string[] =>
    useSelector((state: WithVariantsState) => selectVariantsForGroup(state, group));
