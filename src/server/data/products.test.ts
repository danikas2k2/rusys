/** @vitest-environment node */
import { bulk } from '@tests/bulk';
import { getProductsFixture } from '@tests/fixtures';

import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { addVariantAmount } from '~/common/utils/amounts';
import {
    addProduct,
    deleteProduct,
    deleteProductsGroup,
    deleteProductsVariant,
    getProducts,
    getProductVariants,
    moveProduct,
    redoProduct,
    renameProduct,
    renameProductsGroup,
    renameProductsVariant,
    setMissing,
    setRemoving,
    undoProduct,
    updateProduct,
} from '~/server/data/products';
import { $all } from '~/server/data/tests/utils';
import { db } from '~/server/db';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/years'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/variants'));

describe('products', () => {
    vi.setConfig({ testTimeout: 30_000 });

    const products = getProductsFixture();

    beforeEach(async () => {
        await (await db()).collection('products').insertMany(products, { forceServerObjectId: true });
    });

    afterEach(async () => {
        await (await db()).collection('products').deleteMany({});
    });

    describe('getProducts', () => {
        it('returns products for specified years', async () => {
            await expect(getProducts([21, 22])).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }],
                    updates: expect.arrayContaining([{ year: 22 }]),
                },
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: expect.arrayContaining([{ year: 21 }]),
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                    missing: true,
                    updates: expect.arrayContaining([{ year: 22 }]),
                },
            ]);
        });

        it('returns products for different years', async () => {
            await expect(getProducts([20, 21])).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: expect.arrayContaining([{ year: 21 }]),
                },
            ]);
        });

        it('returns products for empty years', async () => {
            await expect(getProducts()).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }],
                    updates: expect.arrayContaining([{ year: 22 }]),
                },
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: expect.arrayContaining([{ year: 21 }]),
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                    missing: true,
                    updates: expect.arrayContaining([{ year: 22 }]),
                },
            ]);
        });

        it('returns no products for invalid years', async () => {
            await expect(getProducts([23, 24])).resolves.toStrictEqual([]);
        });
    });

    describe('getProductVariants', () => {
        it('returns products variants', async () => {
            await expect(getProductVariants('Uogienės', 'Braškės')).resolves.toStrictEqual(
                expect.arrayContaining(['p', 'm'])
            );
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Braškės'}
            ${'invalid name'}  | ${'Uogienės'} | ${'Bruknės'}
            ${'empty group'}   | ${''}         | ${'Braškės'}
            ${'empty name'}    | ${'Uogienės'} | ${''}
        `('returns no variants for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(getProductVariants(group, name)).resolves.toBeUndefined();
        });
    });

    const time = expect.any(Number);

    const user = DEV_MODE_EMAIL;

    describe('addProduct', () => {
        it('adds products for new group and specified name', async () => {
            await expect(addProduct('Šaldyti', 'Cukai')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual([...products, { group: 'Šaldyti', name: 'Cukai' }]);
        });

        it.each`
            title            | group         | name
            ${'empty group'} | ${''}         | ${'Braškės'}
            ${'empty name'}  | ${'Uogienės'} | ${''}
        `('does not add products for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(addProduct(group, name)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('updateProduct', () => {
        const amounts = [
            { variant: 'p', amount: 1, recycled: false },
            { variant: 'm', amount: 2 },
            { variant: 'd', amount: -1, recycled: true },
        ];

        it('updates products for existing group, name, and year', async () => {
            await expect(updateProduct('Daržovės', 'Agurkai', 22, amounts, user)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.years.0.amounts': [
                            { variant: 'd', amount: 2 },
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                        ],
                    },
                    $push: {
                        '2.updates': {
                            time,
                            user,
                            years: [
                                {
                                    year: 22,
                                    amounts: [
                                        { variant: 'p', amount: 1, recycled: false },
                                        { variant: 'm', amount: 2 },
                                        { variant: 'd', amount: -1, recycled: true },
                                    ],
                                },
                            ],
                        },
                    },
                })
            );
        });

        it('updates products for existing group, name, and year but with different variant', async () => {
            await expect(
                updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'x', amount: 1, recycled: false }], user)
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.years.0.amounts': [
                            { variant: 'd', amount: 3 },
                            { variant: 'x', amount: 1 },
                        ],
                    },
                    $push: {
                        '2.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'x', amount: 1, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it('updates products for existing group, name, but with 0 year for non-annual items', async () => {
            await expect(updateProduct('Daržovės', 'Agurkai', 0, amounts, user)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.years.0.year': 0,
                        '2.years.0.amounts': [
                            { variant: 'd', amount: 2 },
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                        ],
                    },
                    $push: {
                        '2.updates': {
                            time,
                            user,
                            years: [
                                {
                                    year: 0,
                                    amounts: [
                                        { variant: 'p', amount: 1, recycled: false },
                                        { variant: 'm', amount: 2 },
                                        { variant: 'd', amount: -1, recycled: true },
                                    ],
                                },
                            ],
                        },
                    },
                })
            );
        });

        it('does not update products if no updates made', async () => {
            const bruknes = { group: 'Uogienės', name: 'Bruknės', years: [{ year: 21, amounts: [] }] };
            await (await db()).collection('products').insertOne(bruknes, { forceServerObjectId: true });

            await expect(updateProduct('Uogienės', 'Bruknės', 21, [{ variant: 'p', amount: 0 }])).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual([...products, bruknes]);
        });

        const change = { variant: 'p', amount: 1, recycled: false };

        it.each`
            title                  | group         | name         | year  | changes
            ${'invalid name'}      | ${'Uogienės'} | ${'Bruknės'} | ${22} | ${[change]}
            ${'invalid group'}     | ${'Šaldyti'}  | ${'Agurkai'} | ${22} | ${[change]}
            ${'empty group'}       | ${''}         | ${'Agurkai'} | ${22} | ${[change]}
            ${'empty name'}        | ${'Daržovės'} | ${''}        | ${22} | ${[change]}
            ${'empty changes'}     | ${'Uogienės'} | ${'Avietės'} | ${22} | ${[]}
            ${'undefined changes'} | ${'Uogienės'} | ${'Avietės'} | ${22} | ${undefined}
        `(
            'does not update products for $title',
            async ({ group, name, year, changes }: { group: string; name: string; year: number; changes: any }) => {
                await expect(updateProduct(group, name, year, changes)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );

        it('removes missing flag when missing and negative update received', async () => {
            await updateProduct('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: -1, recycled: false }], user);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $unset: ['1.missing'],
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: {
                        '1.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -1, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it('does not remove missing flag when missing and positive update received', async () => {
            await updateProduct('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: 1, recycled: false }], user);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: { '1.years.0.amounts.0.amount': 3 },
                    $push: {
                        '1.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it('does not remove missing flag when missing and recycled update received', async () => {
            const amount = { variant: 'p', amount: -1, recycled: true };
            await updateProduct('Uogienės', 'Braškės', 22, [amount], user);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: { '1.updates': { time, user, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('removes missing flag when missing and recycled update received and no amount left', async () => {
            await updateProduct('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: -2, recycled: false }], user);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $unset: ['1.missing', '1.years'],
                    $push: {
                        '1.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -2, recycled: false }] }],
                        },
                    },
                })
            );
        });
    });

    describe('undoProduct', () => {
        it('returns false for empty group or name', async () => {
            await expect(undoProduct('', 'Agurkai', 22)).resolves.toBe(false);
            await expect(undoProduct('Daržovės', '', 22)).resolves.toBe(false);
        });

        it('returns false when product has no updates for that year', async () => {
            await expect(undoProduct('Daržovės', 'Kopūstai', 21)).resolves.toBe(false);
        });

        it('undoes a consumed update', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.undates': [
                            {
                                time,
                                user,
                                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
                            },
                        ],
                    },
                })
            );
        });

        it('reverts inventory changes when undoing', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -3, recycled: false }], user);

            const beforeUndo = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            // inventory hits 0 so year entry is removed
            expect(beforeUndo[2].years).toBeUndefined();

            await undoProduct('Daržovės', 'Agurkai', 22);
            const afterUndo = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            expect(afterUndo[2].years?.[0].amounts[0].amount).toBe(3);
        });

        it('moves last update to undates', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const agurkai = all[2];

            expect(agurkai.undates).toHaveLength(1);
            expect(agurkai.updates).toHaveLength(2);
        });

        it('stacks multiple undos correctly', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);
            await undoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const agurkai = all[2];

            expect(agurkai.undates).toHaveLength(2);
            expect(agurkai.updates).toHaveLength(2);
        });

        it('clears year entry when undo brings inventory to zero', async () => {
            await updateProduct('Daržovės', 'Kopūstai', 21, [{ variant: 'p', amount: 2, recycled: false }], user);
            await updateProduct('Daržovės', 'Kopūstai', 21, [{ variant: 'p', amount: -4, recycled: false }], user);
            await undoProduct('Daržovės', 'Kopūstai', 21);

            const all = (await $all('products')) as { years?: { year: number }[]; updates?: unknown[] }[];
            const kopustai = all[3];

            expect(kopustai.years?.find((y) => y.year === 21)).toBeDefined();
        });

        it('undoes a recycled update', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -3, recycled: true }], user);
            const afterUpdate = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            // inventory hits 0 so year entry is removed
            expect(afterUpdate[2].years).toBeUndefined();

            await undoProduct('Daržovės', 'Agurkai', 22);
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            expect(afterUndo).toBe(3);
        });

        it('undoes an updated (no recycled field) entry', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2 }], user);
            const afterUpdate = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await undoProduct('Daržovės', 'Agurkai', 22);
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            expect(afterUpdate).toBe(5);
            expect(afterUndo).toBe(3);
        });
    });

    describe('redoProduct', () => {
        it('returns false for empty group or name', async () => {
            await expect(redoProduct('', 'Agurkai', 22)).resolves.toBe(false);
            await expect(redoProduct('Daržovės', '', 22)).resolves.toBe(false);
        });

        it('returns false when product has no undates for that year', async () => {
            await expect(redoProduct('Daržovės', 'Kopūstai', 21)).resolves.toBe(false);
        });

        it('redoes last undone update', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
            const afterUpdate = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await undoProduct('Daržovės', 'Agurkai', 22);
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await redoProduct('Daržovės', 'Agurkai', 22);
            const afterRedo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            expect(afterUpdate).toBe(5);
            expect(afterUndo).toBe(3);
            expect(afterRedo).toBe(5);
        });

        it('moves last undate back to updates', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);

            const beforeRedo = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(beforeRedo[2].updates).toHaveLength(2);
            expect(beforeRedo[2].undates).toHaveLength(1);

            await redoProduct('Daržovės', 'Agurkai', 22);

            const afterRedo = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(afterRedo[2].updates).toHaveLength(3);
            expect(afterRedo[2].undates).toBeUndefined();
        });

        it('redoes multiple undos in correct order (LIFO)', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);
            await undoProduct('Daržovės', 'Agurkai', 22);

            await redoProduct('Daržovės', 'Agurkai', 22);
            await redoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const agurkai = all[2];

            expect(agurkai.updates).toHaveLength(4);
            expect(agurkai.undates).toBeUndefined();
        });

        it('new update clears undates, making redo impossible', async () => {
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);
            await updateProduct('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);

            await expect(redoProduct('Daržovės', 'Agurkai', 22)).resolves.toBe(false);

            const all = (await $all('products')) as { undates?: unknown[] }[];

            expect(all[2].undates).toBeUndefined();
        });

        it('undo on fixture product with pre-existing updates leaves undates with one entry', async () => {
            await undoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(all[2].updates).toHaveLength(1);
            expect(all[2].undates).toHaveLength(1);
        });
    });

    describe('addVariantAmount', () => {
        it('adds variant amount to empty array', async () => {
            expect(addVariantAmount([], { variant: 'p', amount: 1 })).toStrictEqual([{ variant: 'p', amount: 1 }]);
        });

        it('adds variant amount to array with different variant', async () => {
            expect(addVariantAmount([{ variant: 'd', amount: 1 }], { variant: 'p', amount: 1 })).toStrictEqual([
                { variant: 'd', amount: 1 },
                { variant: 'p', amount: 1 },
            ]);
        });

        it('adds variant amount to array with same variant', async () => {
            expect(addVariantAmount([{ variant: 'p', amount: 1 }], { variant: 'p', amount: 1 })).toStrictEqual([
                { variant: 'p', amount: 2 },
            ]);
        });

        it('adds variant amount to array with more variants', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'd', amount: 1 },
                        { variant: 'p', amount: 1 },
                    ],
                    { variant: 'p', amount: 1 }
                )
            ).toStrictEqual([
                { variant: 'd', amount: 1 },
                { variant: 'p', amount: 2 },
            ]);
        });

        it('adds variant amount to array with negative amount', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'p', amount: 2 },
                        { variant: 'd', amount: 1 },
                    ],
                    { variant: 'p', amount: -1 }
                )
            ).toStrictEqual([
                { variant: 'p', amount: 1 },
                { variant: 'd', amount: 1 },
            ]);
        });

        it('adds variant amount to array with negative amount to get zero in result', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'p', amount: 1 },
                        { variant: 'd', amount: 1 },
                    ],
                    { variant: 'p', amount: -1 }
                )
            ).toStrictEqual([
                { variant: 'p', amount: 0 },
                { variant: 'd', amount: 1 },
            ]);
        });
    });

    describe('renameProduct', () => {
        it('renames products', async () => {
            await expect(renameProduct('Daržovės', 'Agurkai', 'Z')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '2.name': 'Z' } }));
        });

        it('renames products for different group', async () => {
            await expect(renameProduct('Uogienės', 'Avietės', 'Agrastai')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '0.name': 'Agrastai' } }));
        });

        it.each`
            title                  | group         | name         | newName
            ${'invalid group'}     | ${'Šaldyti'}  | ${'Krapai'}  | ${'Krabai'}
            ${'invalid name'}      | ${'Daržovės'} | ${'Burokai'} | ${'Runkeliai'}
            ${'same names'}        | ${'Uogienės'} | ${'Avietės'} | ${'Avietės'}
            ${'already used name'} | ${'Uogienės'} | ${'Avietės'} | ${'Braškės'}
            ${'empty group'}       | ${''}         | ${'Krapai'}  | ${'Krabai'}
            ${'empty name'}        | ${'Šaldyti'}  | ${''}        | ${'Krabai'}
            ${'empty new name'}    | ${'Šaldyti'}  | ${'Krapai'}  | ${''}
        `(
            'does not rename products for $title',
            async ({ group, name, newName }: { group: string; name: string; newName: string }) => {
                await expect(renameProduct(group, name, newName)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('renameProductVariant', () => {
        it('renames products variant', async () => {
            await expect(renameProductsVariant('Daržovės', 'd', '3/4')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.1.variant': '3/4',
                    },
                })
            );
        });

        it('renames products variant when some structure data is missing', async () => {
            const d = {
                group: 'Daržovės',
                name: 'Pustuštis',
                years: [
                    { year: 21 },
                    { year: 22, amounts: [{ variant: 'd', amount: 5 }] },
                    { year: 24, amounts: [{ variant: 'd', amount: 5 }] },
                ],
                updates: [
                    {
                        time: Date.parse('2025-01-01T12:00:00.000Z'),
                        years: [
                            { year: 21 },
                            { year: 22, amounts: [{ variant: 'd', amount: -1 }] },
                            { year: 24, amounts: [{ variant: 'd', amount: -2 }] },
                        ],
                    },
                ],
            };

            await (await db()).collection('products').insertOne(d, { forceServerObjectId: true });

            await expect(renameProductsVariant('Daržovės', 'd', '3/4')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk([...products, d], {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.1.variant': '3/4',
                        '4.years.1.amounts.0.variant': '3/4',
                        '4.years.2.amounts.0.variant': '3/4',
                        '4.updates.0.years.1.amounts.0.variant': '3/4',
                        '4.updates.0.years.2.amounts.0.variant': '3/4',
                    },
                })
            );
        });

        it('renames products variant for different group', async () => {
            await expect(renameProductsVariant('Uogienės', 'p', '1/2')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '0.years.0.amounts.0.variant': '1/2',
                        '0.updates.0.years.0.amounts.0.variant': '1/2',
                        '0.updates.0.years.1.amounts.0.variant': '1/2',
                        '0.updates.1.years.0.amounts.0.variant': '1/2',
                        '0.updates.1.years.1.amounts.0.variant': '1/2',
                        '0.updates.2.years.0.amounts.0.variant': '1/2',
                        '1.years.0.amounts.0.variant': '1/2',
                        '1.updates.0.years.0.amounts.0.variant': '1/2',
                        '1.updates.1.years.0.amounts.0.variant': '1/2',
                        '1.updates.2.years.0.amounts.0.variant': '1/2',
                    },
                })
            );
        });

        it('renames products variant on second year', async () => {
            await updateProduct('Daržovės', 'Kopūstai', 22, [{ variant: 'p', amount: 1, recycled: false }], user);

            await expect(renameProductsVariant('Daržovės', 'p', '1/2')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.updates.0.years.0.amounts.0.variant': '1/2',
                        '3.years.0.amounts.0.variant': '1/2',
                    },
                    $push: {
                        '3.years': { year: 22, amounts: [{ variant: '1/2', amount: 1 }] },
                        '3.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: '1/2', amount: 1, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it('renames products second variant on first year', async () => {
            await updateProduct('Daržovės', 'Kopūstai', 21, [{ variant: 'd', amount: 1, recycled: false }], user);

            await expect(renameProductsVariant('Daržovės', 'd', '3/4')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.1.variant': '3/4',
                    },
                    $push: {
                        '3.years.0.amounts': { variant: '3/4', amount: 1 },
                        '3.updates': {
                            time,
                            user,
                            years: [{ year: 21, amounts: [{ variant: '3/4', amount: 1, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it.each`
            title                  | group         | variant  | newVariant
            ${'invalid group'}     | ${'Šaldyti'}  | ${'p'}   | ${'1/2'}
            ${'invalid variant'}   | ${'Daržovės'} | ${'0.5'} | ${'1/2'}
            ${'same variants'}     | ${'Daržovės'} | ${'p'}   | ${'p'}
            ${'empty group'}       | ${''}         | ${'p'}   | ${'b'}
            ${'empty variant'}     | ${'Daržovės'} | ${''}    | ${'b'}
            ${'empty new variant'} | ${'Daržovės'} | ${'p'}   | ${''}
        `(
            'does not rename variant for $title',
            async ({ group, variant, newVariant }: { group: string; variant: string; newVariant: string }) => {
                await expect(renameProductsVariant(group, variant, newVariant)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('renameProductGroup', () => {
        it('renames products group', async () => {
            await expect(renameProductsGroup('Daržovės', 'Šaldyti')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '2.group': 'Šaldyti', '3.group': 'Šaldyti' } })
            );
        });

        it('renames different group', async () => {
            await expect(renameProductsGroup('Uogienės', 'Šaldyti')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '0.group': 'Šaldyti', '1.group': 'Šaldyti' } })
            );
        });

        it.each`
            title              | group         | newGroup
            ${'invalid group'} | ${'Šaldyti'}  | ${'Uogienės'}
            ${'same groups'}   | ${'Daržovės'} | ${'Daržovės'}
            ${'empty group'}   | ${''}         | ${'Daržovės'}
            ${'empty variant'} | ${'Daržovės'} | ${''}
        `('does not rename group for $title', async ({ group, newGroup }: { group: string; newGroup: string }) => {
            await expect(renameProductsGroup(group, newGroup)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('moveProduct', () => {
        it('moves products', async () => {
            await expect(moveProduct('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '2.group': 'Šaldyti' } }));
        });

        it('moves products from different group', async () => {
            await expect(moveProduct('Uogienės', 'Avietės', 'Šaldyti')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '0.group': 'Šaldyti' } }));
        });

        it('moves products with new name', async () => {
            await expect(moveProduct('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '2.group': 'Šaldyti', '2.name': 'Agurkėliai' } })
            );
        });

        it('moves products with old name if new name is empty', async () => {
            await expect(moveProduct('Daržovės', 'Agurkai', 'Šaldyti', '')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '2.group': 'Šaldyti' } }));
        });

        it.each`
            title                       | group         | name         | newGroup
            ${'invalid group'}          | ${'Šaldyti'}  | ${'Krapai'}  | ${'Uogienės'}
            ${'invalid name'}           | ${'Daržovės'} | ${'Braškės'} | ${'Šaldyti'}
            ${'same groups'}            | ${'Daržovės'} | ${'Agurkai'} | ${'Daržovės'}
            ${'same name in new group'} | ${'Uogienės'} | ${'Agurkai'} | ${'Daržovės'}
            ${'empty group'}            | ${''}         | ${'Agurkai'} | ${'Daržovės'}
            ${'empty name'}             | ${'Daržovės'} | ${''}        | ${'Šaldyti'}
            ${'empty new group'}        | ${'Daržovės'} | ${'Agurkai'} | ${''}
        `(
            'does not move products for $title',
            async ({ group, name, newGroup }: { group: string; name: string; newGroup: string }) => {
                await expect(moveProduct(group, name, newGroup)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('deleteProduct', () => {
        it('deletes products', async () => {
            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $remove: 2 }));
        });

        it('deletes products from different group', async () => {
            await expect(deleteProduct('Uogienės', 'Avietės')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(products.slice(1));
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Krapai'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'}
            ${'empty group'}   | ${''}         | ${'Agurkai'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does not delete products for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(deleteProduct(group, name)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('deleteProductVariant', () => {
        it('deletes products variant', async () => {
            await expect(deleteProductsVariant('Daržovės', 'p')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $unset: ['3.years', '3.updates'],
                    $set: { '2.updates.0.years.0.amounts': [{ variant: 'd', amount: -3, recycled: false }] },
                })
            );
        });

        it('deletes products variant for different group', async () => {
            await expect(deleteProductsVariant('Uogienės', 'p')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(
                    products,
                    { $unset: ['0.years', '0.updates', '1.years'] },
                    { $shift: ['1.updates', '1.updates.0.years', '1.updates.1.years.0.amounts'] }
                )
            );
        });

        it('deletes products variant for second year', async () => {
            await updateProduct(
                'Daržovės',
                'Kopūstai',
                22,
                [
                    { variant: 'm', amount: 2, recycled: false },
                    { variant: 'd', amount: 1, recycled: false },
                ],
                user
            );

            await expect(deleteProductsVariant('Daržovės', 'd')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $unset: ['2.years'],
                    $set: {
                        '2.updates': [
                            {
                                time: 1675425600000,
                                years: [{ year: 22, amounts: [{ variant: 'p', amount: 2, recycled: false }] }],
                            },
                            {
                                time: 1675771200000,
                                years: [{ year: 22, amounts: [{ variant: 'm', amount: -1 }] }],
                            },
                        ],
                    },
                    $push: {
                        '3.years': { year: 22, amounts: [{ variant: 'm', amount: 2 }] },
                        '3.updates': {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'm', amount: 2, recycled: false }] }],
                        },
                    },
                })
            );
        });

        it.each`
            title                | group         | variant
            ${'invalid group'}   | ${'Šaldyti'}  | ${'p'}
            ${'invalid variant'} | ${'Daržovės'} | ${'0.5'}
            ${'empty group'}     | ${''}         | ${'Agurkai'}
            ${'empty variant'}   | ${'Daržovės'} | ${''}
        `('does not delete variant for $title', async ({ group, variant }: { group: string; variant: string }) => {
            await expect(deleteProductsVariant(group, variant)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('deleteProductGroup', () => {
        it('deletes products by group', async () => {
            await expect(deleteProductsGroup('Daržovės')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(products.slice(0, 2));
        });

        it('deletes products by different group', async () => {
            await expect(deleteProductsGroup('Uogienės')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(products.slice(2));
        });

        it.each`
            title              | group
            ${'invalid group'} | ${'Šaldyti'}
            ${'empty group'}   | ${''}
        `('does not delete variant for $title', async ({ group }: { group: string }) => {
            await expect(deleteProductsGroup(group)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setRemoving', () => {
        it('sets removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Agurkai', 22, true)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '2.years.0.removing': true } })
            );
        });

        it('sets removing by different group, name, and year', async () => {
            await expect(setRemoving('Uogienės', 'Braškės', 22, true)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '1.years.0.removing': true } })
            );
        });

        it('sets not removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Kopūstai', 21, false)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $unset: '3.years.0.removing' }));
        });

        it.each`
            title                     | group         | name          | year  | removing
            ${'already removing'}     | ${'Daržovės'} | ${'Kopūstai'} | ${21} | ${true}
            ${'already not removing'} | ${'Uogienės'} | ${'Avietės'}  | ${21} | ${false}
            ${'invalid group'}        | ${'Šaldyti'}  | ${'Krapai'}   | ${22} | ${true}
            ${'invalid name'}         | ${'Uogienės'} | ${'Bruknės'}  | ${22} | ${true}
            ${'invalid year'}         | ${'Uogienės'} | ${'Avietės'}  | ${20} | ${true}
            ${'empty group'}          | ${''}         | ${'Krapai'}   | ${22} | ${true}
            ${'empty name'}           | ${'Uogienės'} | ${''}         | ${22} | ${true}
            ${'empty year'}           | ${'Uogienės'} | ${'Avietės'}  | ${0}  | ${true}
        `(
            'does not change removing for $title',
            async ({
                group,
                name,
                year,
                removing,
            }: {
                group: string;
                name: string;
                year: number;
                removing: boolean;
            }) => {
                await expect(setRemoving(group, name, year, removing)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('setMissing', () => {
        it('sets missing item', async () => {
            await expect(setMissing('Uogienės', 'Avietės', true)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '0.missing': true } }));
        });

        it('unsets missing item', async () => {
            await expect(setMissing('Uogienės', 'Braškės', false)).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $unset: '1.missing' }));
        });

        it.each`
            title                    | group         | name          | missing
            ${'already missing'}     | ${'Uogienės'} | ${'Braškės'}  | ${true}
            ${'already not missing'} | ${'Uogienės'} | ${'Avietės'}  | ${false}
            ${'invalid group'}       | ${'Šaldyti'}  | ${'Krapai'}   | ${true}
            ${'invalid name'}        | ${'Uogienės'} | ${'Citrinos'} | ${true}
            ${'empty group'}         | ${''}         | ${'Krapai'}   | ${true}
            ${'empty name'}          | ${'Uogienės'} | ${''}         | ${true}
        `(
            'does not change invalid for $title',
            async ({ group, name, missing }: { group: string; name: string; missing: boolean }) => {
                await expect(setMissing(group, name, missing)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });
});
