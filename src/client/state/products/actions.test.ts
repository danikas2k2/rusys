import { getProductsFixture } from '@tests/fixtures';

import type { Product } from '@rusys/common/data';

import { ProductsActionType, setProductsAction } from '~/client/state/products/actions';

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
