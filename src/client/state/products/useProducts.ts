import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { WithProductsState } from '~/client/state/products/types';
import type { Product } from '~/types/data';

export const useProducts = (): readonly Product[] =>
    useSelector((state: WithProductsState) => state.products ?? [], equal);
