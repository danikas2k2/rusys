import { useSelector } from 'react-redux';

import type { WithProductsState } from './types';

export const useHasMissing = (): boolean =>
    useSelector((state: WithProductsState) => state.products?.some((v) => v.missing) ?? false);
