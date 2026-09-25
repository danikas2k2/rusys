import type { Product } from '@rusys/common/data';
import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithProductsState } from '~/store/products/types';

export const useProducts = (): readonly Product[] =>
    useSelector((state: WithProductsState) => state.products ?? [], equal);
