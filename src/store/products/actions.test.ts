import { getProductsFixture } from '@tests/fixtures';

import type { Product } from '~/common/data';
import { ProductsActionType, setProductHistoryAction, setProductsAction } from '~/store/products/actions';

describe('setProductsAction', () => {
    it('returns valid action', () => {
        const products = getProductsFixture();

        expect(setProductsAction(products)).toStrictEqual({ type: ProductsActionType.SET, products });
    });

    it('returns valid action for empty set', () => {
        const products: Product[] = [];

        expect(setProductsAction(products)).toStrictEqual({ type: ProductsActionType.SET, products });
    });

    it('returns an action to cache one product year history', () => {
        const history = { updates: [], undates: [] };

        expect(setProductHistoryAction('Uogienės', 'Avietės', 26, history)).toStrictEqual({
            type: ProductsActionType.SET_HISTORY,
            group: 'Uogienės',
            name: 'Avietės',
            year: 26,
            history,
        });
    });
});
