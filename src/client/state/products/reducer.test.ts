import { bulk } from '@tests/bulk';
import { getProductsFixture } from '@tests/fixtures';

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
                    {
                        type: ProductsActionType.SET_REMOVING,
                        group: 'Daržovės',
                        name: 'Kopūstai',
                        year: 21,
                        removing: false,
                    }
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
                    {
                        type: ProductsActionType.SET_REMOVING,
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                        removing: false,
                    }
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
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[1].years[0].removing': false,
                            '[1].years[0].prevRemoving': true,
                        },
                    }),
                    {
                        type: ProductsActionType.ROLLBACK_REMOVING,
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                    }
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
                    {
                        type: ProductsActionType.ROLLBACK_REMOVING,
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                    }
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
                reducer(products, {
                    type: ProductsActionType.ROLLBACK_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 23,
                })
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.ROLLBACK_REMOVING,
                    group: 'Uogienės',
                    name: 'Nonexistent',
                    year: 22,
                })
            ).toStrictEqual(products);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(products, {
                    type: ProductsActionType.ROLLBACK_REMOVING,
                    group: 'Nonexistent',
                    name: 'Avietės',
                    year: 21,
                })
            ).toStrictEqual(products);
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
            expect(
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
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
                    {
                        type: ProductsActionType.SET_MISSING,
                        group: 'Daržovės',
                        name: 'Agurkai',
                        missing: false,
                    }
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
                reducer(products, {
                    type: ProductsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Nonexistent',
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

        it('saves prevMissing when updating missing', () => {
            expect(
                reducer(
                    bulk(products, {
                        $set: {
                            '[0].missing': true,
                        },
                    }),
                    {
                        type: ProductsActionType.SET_MISSING,
                        group: 'Uogienės',
                        name: 'Avietės',
                        missing: false,
                    }
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
            expect(
                reducer([], {
                    type: ProductsActionType.ROLLBACK_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                })
            ).toStrictEqual([]);
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
                    {
                        type: ProductsActionType.ROLLBACK_MISSING,
                        group: 'Uogienės',
                        name: 'Avietės',
                    }
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
                    {
                        type: ProductsActionType.ROLLBACK_MISSING,
                        group: 'Uogienės',
                        name: 'Avietės',
                    }
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
                reducer(products, {
                    type: ProductsActionType.ROLLBACK_MISSING,
                    group: 'Uogienės',
                    name: 'Nonexistent',
                })
            ).toStrictEqual(products);
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
