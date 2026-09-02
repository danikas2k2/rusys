import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithProductsState } from '~/client/state/products/types';
import type { Product } from '~/common/data';

export const useProducts = (): readonly Product[] =>
    useSelector((state: WithProductsState) => state.products ?? [], equal);
