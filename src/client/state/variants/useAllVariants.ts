import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithVariantsState } from '~/client/state/variants/types';

export function useAllVariants(group: string): string[] {
    return useSelector(
        (state: WithVariantsState) =>
            state.variants
                ?.filter((v) => v.group === group)
                .sort((a, b) => a.order - b.order)
                .map((v) => v.variant) ?? [],
        isEqual
    );
}
