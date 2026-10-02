import { bulk } from '@tests/bulk';
import { getProductsFixture } from '@tests/fixtures';

import type { Product } from '~/common/data';
import {
    products as reducer,
    rollbackProductsMissingAction,
    rollbackProductsRemovingAction,
    setProductHistoryAction,
    setProductsAction,
    setProductsMissingAction,
    setProductsRemovingAction,
} from '~/store/products/slice';

describe('setProductsAction', () => {
    it('returns valid action', () => {
        const products = getProductsFixture();

        expect(setProductsAction(products)).toStrictEqual({ type: setProductsAction.type, payload: products });
    });

    it('returns valid action for empty set', () => {
        const products: Product[] = [];

        expect(setProductsAction(products)).toStrictEqual({ type: setProductsAction.type, payload: products });
    });

    it('returns an action to cache one product year history', () => {
        const history = { updates: [], undates: [] };

        expect(setProductHistoryAction({ group: 'Uogienės', name: 'Avietės', year: 26, history })).toStrictEqual({
            type: setProductHistoryAction.type,
            payload: { group: 'Uogienės', name: 'Avietės', year: 26, history },
        });
    });
});

describe('products', () => {
    const products = getProductsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' };

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
            expect(reducer([], setProductsAction(products))).toStrictEqual(products);
        });

        it('updates empty state with empty set', () => {
            expect(reducer([], setProductsAction([]))).toStrictEqual([]);
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
                    setProductsAction(products)
                )
            ).toStrictEqual(products);
        });

        it('updates undefined state', () => {
            expect(reducer(undefined, setProductsAction(products))).toStrictEqual(products);
        });

        it('keeps a product history cache while refreshing product metadata', () => {
            const history = { 22: { updates: [], undates: [] } };
            const state = [{ ...products[0], history }];

            expect(reducer(state, setProductsAction(products))).toStrictEqual([
                { ...products[0], history },
                ...products.slice(1),
            ]);
        });
    });

    describe('set history', () => {
        it('caches history under its product and year', () => {
            const history = { updates: [], undates: [] };

            expect(
                reducer(products, setProductHistoryAction({ group: 'Uogienės', name: 'Avietės', year: 22, history }))
            ).toStrictEqual([{ ...products[0], history: { 22: history } }, ...products.slice(1)]);
        });
    });

    describe('set removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], setProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 21, removing: true }))
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(
                    products,
                    setProductsRemovingAction({ group: 'Uogienės', name: 'Braškės', year: 22, removing: true })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[1].years[0].removing': true,
                        '[1].years[0].prevRemoving': undefined,
                    },
                })
            );
        });

        it('updates filled state with false', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[3].years[0].removing': true,
                        },
                    }),
                    setProductsRemovingAction({ group: 'Daržovės', name: 'Kopūstai', year: 21, removing: false })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[3].years[0].removing': undefined,
                        '[3].years[0].prevRemoving': true,
                    },
                })
            );
        });

        it('saves prevRemoving when updating removing', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[1].years[0].removing': true,
                        },
                    }),
                    setProductsRemovingAction({ group: 'Uogienės', name: 'Braškės', year: 22, removing: false })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[1].years[0].removing': undefined,
                        '[1].years[0].prevRemoving': true,
                    },
                })
            );
        });

        it('does not update filled state using missing year', () => {
            expect(
                reducer(
                    products,
                    setProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 23, removing: true })
                )
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(
                    products,
                    setProductsRemovingAction({ group: 'Uogienės', name: 'Braškės', year: 21, removing: true })
                )
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(
                    products,
                    setProductsRemovingAction({ group: 'Daržovės', name: 'Avietės', year: 21, removing: true })
                )
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(
                    undefined,
                    setProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 21, removing: true })
                )
            ).toStrictEqual([]);
        });
    });

    describe('rollback removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 21 }))
            ).toStrictEqual([]);
        });

        it('rolls back removing from prevRemoving', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[1].years[0].removing': false,
                            '[1].years[0].prevRemoving': true,
                        },
                    }),
                    rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Braškės', year: 22 })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[1].years[0].removing': true,
                        '[1].years[0].prevRemoving': undefined,
                    },
                })
            );
        });

        it('rolls back removing to undefined when prevRemoving is undefined', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[1].years[0].removing': true,
                        },
                    }),
                    rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Braškės', year: 22 })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[1].years[0].removing': undefined,
                        '[1].years[0].prevRemoving': undefined,
                    },
                })
            );
        });

        it('does not update filled state using missing year', () => {
            expect(
                reducer(products, rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 23 }))
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Nonexistent', year: 22 }))
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, rollbackProductsRemovingAction({ group: 'Nonexistent', name: 'Avietės', year: 21 }))
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, rollbackProductsRemovingAction({ group: 'Uogienės', name: 'Avietės', year: 21 }))
            ).toStrictEqual([]);
        });
    });

    describe('set missing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], setProductsMissingAction({ group: 'Uogienės', name: 'Avietės', missing: true }))
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(products, setProductsMissingAction({ group: 'Uogienės', name: 'Avietės', missing: true }))
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[0].missing': true,
                        '[0].prevMissing': undefined,
                    },
                })
            );
        });

        it('updates filled state using false', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[2].missing': true,
                        },
                    }),
                    setProductsMissingAction({ group: 'Daržovės', name: 'Agurkai', missing: false })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[2].missing': undefined,
                        '[2].prevMissing': true,
                    },
                })
            );
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, setProductsMissingAction({ group: 'Uogienės', name: 'Nonexistent', missing: true }))
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, setProductsMissingAction({ group: 'Daržovės', name: 'Avietės', missing: true }))
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, setProductsMissingAction({ group: 'Uogienės', name: 'Avietės', missing: true }))
            ).toStrictEqual([]);
        });

        it('saves prevMissing when updating missing', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[0].missing': true,
                        },
                    }),
                    setProductsMissingAction({ group: 'Uogienės', name: 'Avietės', missing: false })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[0].missing': undefined,
                        '[0].prevMissing': true,
                    },
                })
            );
        });
    });

    describe('rollback missing', () => {
        it('does not update empty state', () => {
            expect(reducer([], rollbackProductsMissingAction({ group: 'Uogienės', name: 'Avietės' }))).toStrictEqual(
                []
            );
        });

        it('rolls back missing from prevMissing', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[0].missing': false,
                            '[0].prevMissing': true,
                        },
                    }),
                    rollbackProductsMissingAction({ group: 'Uogienės', name: 'Avietės' })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[0].missing': true,
                        '[0].prevMissing': undefined,
                    },
                })
            );
        });

        it('rolls back missing to undefined when prevMissing is undefined', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[0].missing': true,
                        },
                    }),
                    rollbackProductsMissingAction({ group: 'Uogienės', name: 'Avietės' })
                )
            ).toStrictEqual(
                bulk(products, {
                    $set: {
                        '[0].missing': undefined,
                        '[0].prevMissing': undefined,
                    },
                })
            );
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, rollbackProductsMissingAction({ group: 'Uogienės', name: 'Nonexistent' }))
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, rollbackProductsMissingAction({ group: 'Daržovės', name: 'Avietės' }))
            ).toStrictEqual(products);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, rollbackProductsMissingAction({ group: 'Uogienės', name: 'Avietės' }))
            ).toStrictEqual([]);
        });
    });
});
