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
            const result = reducer(products, {
                type: ProductsActionType.SET_REMOVING,
                group: 'Uogienės',
                name: 'Braškės',
                year: 22,
                removing: true,
            });
            expect(result[1].years?.[0]).toStrictEqual(
                expect.objectContaining({
                    removing: true,
                    prevRemoving: undefined,
                })
            );
        });

        it('updates filled state with false', () => {
            const stateWithRemoving = set(cloneDeep(products), '[3].years[0].removing', true);
            const result = reducer(stateWithRemoving, {
                type: ProductsActionType.SET_REMOVING,
                group: 'Daržovės',
                name: 'Kopūstai',
                year: 21,
                removing: false,
            });
            expect(result[3].years?.[0]).toStrictEqual(
                expect.objectContaining({
                    removing: undefined,
                    prevRemoving: true,
                })
            );
        });

        it('saves prevRemoving when updating removing', () => {
            const stateWithRemoving = set(cloneDeep(products), '[1].years[0].removing', true);
            const result = reducer(stateWithRemoving, {
                type: ProductsActionType.SET_REMOVING,
                group: 'Uogienės',
                name: 'Braškės',
                year: 22,
                removing: false,
            });
            expect(result[1].years?.[0]).toStrictEqual(
                expect.objectContaining({
                    removing: undefined,
                    prevRemoving: true,
                })
            );
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

    describe('rollback removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.ROLLBACK_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 21,
                })
            ).toStrictEqual([]);
        });

        it('rolls back removing from prevRemoving', () => {
            const stateWithPrevRemoving = set(cloneDeep(products), '[1].years[0].removing', false);
            const stateWithPrevRemovingValue = set(stateWithPrevRemoving, '[1].years[0].prevRemoving', true);
            const result = reducer(stateWithPrevRemovingValue, {
                type: ProductsActionType.ROLLBACK_REMOVING,
                group: 'Uogienės',
                name: 'Braškės',
                year: 22,
            });
            expect(result[1].years?.[0]).toStrictEqual(
                expect.objectContaining({
                    removing: true,
                    prevRemoving: undefined,
                })
            );
        });

        it('rolls back removing to undefined when prevRemoving is undefined', () => {
            const stateWithRemoving = set(cloneDeep(products), '[1].years[0].removing', true);
            const result = reducer(stateWithRemoving, {
                type: ProductsActionType.ROLLBACK_REMOVING,
                group: 'Uogienės',
                name: 'Braškės',
                year: 22,
            });
            expect(result[1].years?.[0]).toStrictEqual(
                expect.objectContaining({
                    removing: undefined,
                    prevRemoving: undefined,
                })
            );
        });

        it('does not update filled state using missing year', () => {
            const result = reducer(products, {
                type: ProductsActionType.ROLLBACK_REMOVING,
                group: 'Uogienės',
                name: 'Avietės',
                year: 23,
            });
            // Should not change any product since year doesn't match
            expect(result.length).toBe(products.length);
            result.forEach((product, index) => {
                expect(product.group).toBe(products[index].group);
                expect(product.name).toBe(products[index].name);
            });
        });

        it('does not update filled state using missing name', () => {
            const result = reducer(products, {
                type: ProductsActionType.ROLLBACK_REMOVING,
                group: 'Uogienės',
                name: 'Nonexistent',
                year: 22,
            });
            // Should not change any product since name doesn't match
            expect(result.length).toBe(products.length);
            result.forEach((product, index) => {
                expect(product.group).toBe(products[index].group);
                expect(product.name).toBe(products[index].name);
            });
        });

        it('does not update filled state using missing group', () => {
            const result = reducer(products, {
                type: ProductsActionType.ROLLBACK_REMOVING,
                group: 'Nonexistent',
                name: 'Avietės',
                year: 21,
            });
            // Should not change any product since group doesn't match
            expect(result.length).toBe(products.length);
            result.forEach((product, index) => {
                expect(product.group).toBe(products[index].group);
                expect(product.name).toBe(products[index].name);
            });
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProductsActionType.ROLLBACK_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 21,
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
            const result = reducer(products, {
                type: ProductsActionType.SET_MISSING,
                group: 'Uogienės',
                name: 'Avietės',
                missing: true,
            });
            expect(result[0]).toStrictEqual(
                expect.objectContaining({
                    missing: true,
                    prevMissing: undefined,
                })
            );
        });

        it('updates filled state using false', () => {
            const stateWithMissing = set(cloneDeep(products), '[2].missing', true);
            const result = reducer(stateWithMissing, {
                type: ProductsActionType.SET_MISSING,
                group: 'Daržovės',
                name: 'Agurkai',
                missing: false,
            });
            expect(result[2]).toStrictEqual(
                expect.objectContaining({
                    missing: undefined,
                    prevMissing: true,
                })
            );
        });

        it('does not update filled state using missing name', () => {
            const result = reducer(products, {
                type: ProductsActionType.SET_MISSING,
                group: 'Uogienės',
                name: 'Nonexistent',
                missing: true,
            });
            // Should not change any product since name doesn't match
            // Check that no product was modified (all products should remain the same)
            expect(result.length).toBe(products.length);
            result.forEach((product, index) => {
                expect(product.group).toBe(products[index].group);
                expect(product.name).toBe(products[index].name);
                // missing might be undefined in result but true in original, so check with toEqual
                expect(product.missing).toEqual(products[index].missing);
            });
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

        it('saves prevMissing when updating missing', () => {
            const stateWithMissing = set(cloneDeep(products), '[0].missing', true);
            const result = reducer(stateWithMissing, {
                type: ProductsActionType.SET_MISSING,
                group: 'Uogienės',
                name: 'Avietės',
                missing: false,
            });
            expect(result[0]).toStrictEqual(
                expect.objectContaining({
                    missing: undefined,
                    prevMissing: true,
                })
            );
        });
    });

    describe('rollback missing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: ProductsActionType.ROLLBACK_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                })
            ).toStrictEqual([]);
        });

        it('rolls back missing from prevMissing', () => {
            const stateWithPrevMissing = set(cloneDeep(products), '[0].missing', false);
            const stateWithPrevMissingValue = set(stateWithPrevMissing, '[0].prevMissing', true);
            const result = reducer(stateWithPrevMissingValue, {
                type: ProductsActionType.ROLLBACK_MISSING,
                group: 'Uogienės',
                name: 'Avietės',
            });
            expect(result[0]).toStrictEqual(
                expect.objectContaining({
                    missing: true,
                    prevMissing: undefined,
                })
            );
        });

        it('rolls back missing to undefined when prevMissing is undefined', () => {
            const stateWithMissing = set(cloneDeep(products), '[0].missing', true);
            const result = reducer(stateWithMissing, {
                type: ProductsActionType.ROLLBACK_MISSING,
                group: 'Uogienės',
                name: 'Avietės',
            });
            expect(result[0]).toStrictEqual(
                expect.objectContaining({
                    missing: undefined,
                    prevMissing: undefined,
                })
            );
        });

        it('does not update filled state using missing name', () => {
            const result = reducer(products, {
                type: ProductsActionType.ROLLBACK_MISSING,
                group: 'Uogienės',
                name: 'Nonexistent',
            });
            // Should not change any product since name doesn't match
            // Check that no product was modified (all products should remain the same)
            expect(result.length).toBe(products.length);
            result.forEach((product, index) => {
                expect(product.group).toBe(products[index].group);
                expect(product.name).toBe(products[index].name);
                // missing might be undefined in result but true in original, so check with toEqual
                expect(product.missing).toEqual(products[index].missing);
            });
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.ROLLBACK_MISSING,
                    group: 'Daržovės',
                    name: 'Avietės',
                })
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ProductsActionType.ROLLBACK_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                })
            ).toStrictEqual([]);
        });
    });
});
