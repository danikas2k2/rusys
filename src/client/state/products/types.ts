import type { Product } from '@rusys/common/data';

export interface WithProductsState {
    products?: readonly Product[];
}
