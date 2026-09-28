import type { Product } from '~/common/data';

export interface WithProductsState {
    products?: readonly Product[];
}
