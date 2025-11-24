import { useSelector } from 'react-redux';

import type { WithProductsState } from '~/client/state/products/types';
import { useYears } from '~/client/state/years/useYears';

export function useHasRemoving(group: string, name: string): boolean {
    const years = useYears();
    return useSelector(
        (state: WithProductsState) =>
            state.products?.some(
                (v) =>
                    v.group === group && v.name === name && v.years?.some((y) => years.includes(y.year) && y.removing)
            ) ?? false
    );
}
