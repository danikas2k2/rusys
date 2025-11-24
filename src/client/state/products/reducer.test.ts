import { getProductsFixture } from '@tests/fixtures';

import { cloneDeep, set } from 'lodash';

import { ProductsActionType, type ProductsAction } from '~/client/state/products/actions';
import { products as reducer } from '~/client/state/products/reducer';

describe('products', () => {
    const products = getProductsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as ProductsActionType } as ProductsAction;

        it('leave set unchanged', () => {
            expect(reducer(products, unknownAction)).toStrictEqual(products);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('updates empty state', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.SET,
                    products,
                })
            ).toStrictEqual(products);
        });

        it('updates empty state with empty set', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.SET,
                    products: [],
                })
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(
                    [
                        {
                            group: 'Uogienės',
                            name: 'Avietės',
                            years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
                        },
                    ],
                    {
                        type: ProductsActionType.SET,
                        products,
                    }
                )
            ).toStrictEqual(products);
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProductsActionType.SET,
                    products,
                })
            ).toStrictEqual(products);
        });
    });

    describe('set removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 21,
                    removing: true,
                })
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Braškės',
                    year: 22,
                    removing: true,
                })
            ).toStrictEqual(set(cloneDeep(products), '[1].years[0].removing', true));
        });

        it('updates filled state with false', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    year: 21,
                    removing: false,
                })
            ).toStrictEqual(set(cloneDeep(products), '[3].years[0].removing', undefined));
        });

        it('does not update filled state using missing year', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 23,
                    removing: true,
                })
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Braškės',
                    year: 21,
                    removing: true,
                })
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Daržovės',
                    name: 'Avietės',
                    year: 21,
                    removing: true,
                })
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProductsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 21,
                    removing: true,
                })
            ).toStrictEqual([]);
        });
    });

    describe('set missing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toStrictEqual(set(cloneDeep(products), '[0].missing', true));
        });

        it('updates filled state using false', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Daržovės',
                    name: 'Agurkai',
                    missing: false,
                })
            ).toStrictEqual(set(cloneDeep(products), '[2].missing', undefined));
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Braškės',
                    missing: true,
                })
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Daržovės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toStrictEqual([]);
        });
    });
});
