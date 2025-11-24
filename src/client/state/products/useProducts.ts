import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithProductsState } from '~/client/state/products/types';
import type { Product } from '~/types/data';

export const useProducts = (): readonly Product[] =>
    useSelector((state: WithProductsState) => state.products ?? [], isEqual);
