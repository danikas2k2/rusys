import type { Product } from '~/types/data';

export interface WithProductsState {
    products?: readonly Product[];
}
