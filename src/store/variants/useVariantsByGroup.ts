import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import type { Variant } from '~/common/data';
import type { WithVariantsState } from './types';

const selectVariantsForGroup = createSelector(
    [(state: WithVariantsState) => state.variants, (_state: WithVariantsState, group: string) => group],
    (variants, group) => variants?.filter((variant) => variant.group === group) ?? []
);

export const useVariantsByGroup = (group: string): readonly Variant[] =>
    useSelector((state: WithVariantsState) => selectVariantsForGroup(state, group));
