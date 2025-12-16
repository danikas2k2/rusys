import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/client/state/variants/types';

export const useAllVariants = (group: string): string[] =>
    useSelector(
        (state: WithVariantsState) =>
            state.variants
                ?.filter((v) => v.group === group)
                .sort((a, b) => a.order - b.order)
                .map((v) => v.variant) ?? [],
        equal
    );
