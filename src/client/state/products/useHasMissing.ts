import { useSelector } from 'react-redux';

import type { WithProductsState } from '~/client/state/products/types';

export function useHasMissing(): boolean {
    return useSelector((state: WithProductsState) => state.products?.some((v) => v.missing) ?? false);
}
