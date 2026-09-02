import { getProductsFixture } from '@tests/fixtures';

import { ProductsActionType, setProductsAction } from '~/client/state/products/actions';
import type { Product } from '~/common/data';

describe('setProductsAction', () => {
    it('returns valid action', () => {
        const products = getProductsFixture();

        expect(setProductsAction(products)).toStrictEqual({ type: ProductsActionType.SET, products });
    });

    it('returns valid action for empty set', () => {
        const products: Product[] = [];

        expect(setProductsAction(products)).toStrictEqual({ type: ProductsActionType.SET, products });
    });
});
