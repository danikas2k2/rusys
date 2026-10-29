/** @vitest-environment node */
import { getProductsFixture } from '@tests/fixtures';

import _ from 'lodash';

import { addVariantAmount } from '~/common/utils/amounts';
import { SchemaError } from '~/schema';
import { classifyImage, deleteImages, saveImage } from '~/server/data/images';
import {
    addProduct,
    cleanupRecycled,
    deleteProduct,
    deleteProductsGroup,
    deleteProductsVariant,
    getProducts,
    getProductsWithYears,
    getProductUndates,
    getProductUpdates,
    getProductVariants,
    moveConsumedToRecycled,
    moveProduct,
    redoProduct,
    renameProduct,
    renameProductsGroup,
    renameProductsVariant,
    setAmounts,
    setImage,
    setMissing,
    setMissingBulk,
    setProductParent,
    setRemoving,
    setVariantImage,
    transferAmounts,
    undoProduct,
} from '~/server/data/products';
import { $all } from '~/server/data/tests/utils';
import { copyVariants } from '~/server/data/variants';
import { db, withinTransaction } from '~/server/db';
import { DEV_MODE_EMAIL } from '~/store/profile';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/years'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/data/images'));

describe('products', () => {
    vi.setConfig({ testTimeout: 30_000 });

    const products = getProductsFixture();

    beforeEach(async () => {
        await (await db()).collection('products').insertMany(products, { forceServerObjectId: true });
        // Echoes the image with no photo by default - matches how a non-photo-sized upload
        // classifies; individual tests override this when photo classification itself matters.
        vi.mocked(classifyImage).mockImplementation(async (image: string) => ({ image }));
    });

    afterEach(async () => {
        await (await db()).collection('products').deleteMany({});
    });

    describe('getProducts', () => {
        it('ignores zero and absent years when collecting the available years', async () => {
            await (await db()).collection('products').insertMany([
                { group: 'Daržovės', name: 'No years' },
                { group: 'Daržovės', name: 'Zero year', years: [{ year: 0, amounts: [] }] },
            ]);

            const result = await withinTransaction((session) => getProductsWithYears(session));

            expect(result.products).toContainEqual(expect.objectContaining({ name: 'No years' }));
            expect(result.products).toContainEqual(expect.objectContaining({ name: 'Zero year' }));
            expect(result.years).not.toContain(0);
        });

        it('excludes products whose category is archived', async () => {
            await (await db()).collection('groups').insertOne({ group: 'Uogienės', archivedAt: Date.now() });
            try {
                const visible = await withinTransaction((session) => getProducts([], session));

                expect(visible.every(({ group }) => group !== 'Uogienės')).toBe(true);
                expect(visible.some(({ group }) => group === 'Daržovės')).toBe(true);
            } finally {
                await (await db()).collection('groups').deleteMany({ group: 'Uogienės' });
            }
        });

        it('includes product years beyond the default year window', async () => {
            await (await db()).collection('products').insertOne({
                group: 'Daržovės',
                name: 'Burokėliai',
                years: [{ year: 25, amounts: [] }],
            });

            const result = await withinTransaction((session) => getProductsWithYears(session));

            expect(result.products).toContainEqual(expect.objectContaining({ name: 'Burokėliai' }));
            expect(result.years).toStrictEqual([25, 23, 22, 21]);
        });

        it('returns full updates and undates with unique history years', async () => {
            const updates = [
                {
                    time: 1,
                    years: [
                        { year: 19, amounts: [] },
                        { year: 20, amounts: [] },
                    ],
                },
            ];
            const undates = [
                {
                    time: 2,
                    years: [
                        { year: 20, amounts: [] },
                        { year: 18, amounts: [] },
                    ],
                },
            ];
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'History', updates, undates });
            const result = (await withinTransaction((session) => getProducts([], session))).find(
                ({ name }) => name === 'History'
            );

            expect(result).toMatchObject({ updates, undates, historyYears: [19, 20, 18] });
        });

        it('returns expiry tolerance days', async () => {
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Morkos' }, { $set: { expiryToleranceDays: 365 } });

            await expect(withinTransaction((session) => getProducts([22], session))).resolves.toContainEqual(
                expect.objectContaining({ group: 'Daržovės', name: 'Morkos', expiryToleranceDays: 365 })
            );
        });

        it('returns products for specified years', async () => {
            await expect(withinTransaction((session) => getProducts([21, 22], session))).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    historyYears: [],
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Daržovės',
                    name: 'Morkos',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }],
                    updates: products.find((product) => product.name === 'Morkos')?.updates,
                    historyYears: [22],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: products.find((product) => product.name === 'Avietės')?.updates,
                    historyYears: [20, 21, 22],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                    missing: true,
                    updates: products.find((product) => product.name === 'Braškės')?.updates,
                    historyYears: [21, 22],
                },
            ]);
        });

        it('returns products for different years', async () => {
            await expect(withinTransaction((session) => getProducts([20, 21], session))).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    historyYears: [],
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: products.find((product) => product.name === 'Avietės')?.updates,
                    historyYears: [20, 21, 22],
                },
            ]);
        });

        it('returns products for empty years', async () => {
            await expect(withinTransaction((session) => getProducts([], session))).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    historyYears: [],
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                {
                    group: 'Daržovės',
                    name: 'Morkos',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }],
                    updates: products.find((product) => product.name === 'Morkos')?.updates,
                    historyYears: [22],
                },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                    updates: products.find((product) => product.name === 'Avietės')?.updates,
                    historyYears: [20, 21, 22],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                    missing: true,
                    updates: products.find((product) => product.name === 'Braškės')?.updates,
                    historyYears: [21, 22],
                },
            ]);
        });

        it('returns no products for invalid years', async () => {
            await expect(withinTransaction((session) => getProducts([23, 24], session))).resolves.toStrictEqual([]);
        });

        it('includes the image field when set', async () => {
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Morkos' }, { $set: { image: '/images/ab/cd/morkos.png' } });

            const morkos = (await withinTransaction((session) => getProducts([22], session))).find(
                (p) => p.name === 'Morkos'
            );

            expect(morkos?.image).toBe('/images/ab/cd/morkos.png');
        });

        it('returns stored image and variant photo fields without classifying on read', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Morkos' },
                {
                    $set: {
                        image: '/images/ab/cd/icon.png',
                        photo: '/images/ab/cd/photo.png',
                        variantImages: { '0.5l': '/images/ab/cd/variant-icon.png' },
                        variantPhotos: { '0.5l': '/images/ab/cd/variant-photo.png' },
                    },
                }
            );

            const morkos = (await withinTransaction((session) => getProducts([22], session))).find(
                (product) => product.name === 'Morkos'
            );

            expect(morkos).toMatchObject({
                image: '/images/ab/cd/icon.png',
                photo: '/images/ab/cd/photo.png',
                variantImages: { '0.5l': '/images/ab/cd/variant-icon.png' },
                variantPhotos: { '0.5l': '/images/ab/cd/variant-photo.png' },
            });
            expect(classifyImage).not.toHaveBeenCalled();
        });
    });

    describe('getProductVariants', () => {
        it('returns products variants', async () => {
            await expect(
                withinTransaction((session) => getProductVariants('Uogienės', 'Braškės', session))
            ).resolves.toStrictEqual(expect.arrayContaining(['p', 'm']));
        });

        it('returns no variants for a product without amounts or history', async () => {
            await withinTransaction((session) => addProduct({ group: 'Daržovės', name: 'Tuščias' }, session));

            await expect(
                withinTransaction((session) => getProductVariants('Daržovės', 'Tuščias', session))
            ).resolves.toBeUndefined();
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Braškės'}
            ${'invalid name'}  | ${'Uogienės'} | ${'Bruknės'}
            ${'empty group'}   | ${''}         | ${'Braškės'}
            ${'empty name'}    | ${'Uogienės'} | ${''}
        `('returns no variants for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(
                withinTransaction((session) => getProductVariants(group, name, session))
            ).resolves.toBeUndefined();
        });
    });

    const time = expect.any(Number);

    const user = DEV_MODE_EMAIL;

    describe('addProduct', () => {
        it('reports a duplicate database identity without changing the existing product', async () => {
            await expect(
                withinTransaction((session) => addProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).rejects.toThrow(SchemaError.NameAlreadyExists);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('adds products for new group and specified name', async () => {
            await expect(
                withinTransaction((session) => addProduct({ group: 'Šaldyti', name: 'Cukai' }, session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual([...products, { group: 'Šaldyti', name: 'Cukai' }]);
        });

        it.each`
            title            | group         | name
            ${'empty group'} | ${''}         | ${'Braškės'}
            ${'empty name'}  | ${'Uogienės'} | ${''}
        `('does not add products for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(withinTransaction((session) => addProduct({ group, name }, session))).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('adds a product with a parent that exists in the same group', async () => {
            await expect(
                withinTransaction((session) =>
                    addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual([
                ...products,
                { group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' },
            ]);
        });

        it('does not add a product whose parent does not exist in the same group', async () => {
            await expect(
                withinTransaction((session) =>
                    addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Neegzistuoja' }, session)
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not add a product whose parent exists but in a different group', async () => {
            await expect(
                withinTransaction((session) =>
                    addProduct({ group: 'Uogienės', name: 'Braškės (Zewa)', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not add a product that is its own parent', async () => {
            await expect(
                withinTransaction((session) =>
                    addProduct({ group: 'Daržovės', name: 'Morkos', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setProductParent', () => {
        type ProductRow = { group: string; name: string; parent?: string };

        beforeEach(async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );
        });

        it('sets the parent for a root-level product', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Kopūstai', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Kopūstai')?.parent).toBe('Morkos');
        });

        it('clears the parent when no parent is given', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: undefined }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos (Zewa)')?.parent).toBeUndefined();
        });

        it('rejects setting a product as its own parent', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Morkos', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(false);
        });

        it('rejects setting a direct child as the parent (would create a cycle)', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Morkos', parent: 'Morkos (Zewa)' }, session)
                )
            ).resolves.toBe(false);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')?.parent).toBeUndefined();
        });

        it('rejects setting a grandchild as the parent (cycle at any depth)', async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa) 3sl.', parent: 'Morkos (Zewa)' }, session)
            );

            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Morkos', parent: 'Morkos (Zewa) 3sl.' }, session)
                )
            ).resolves.toBe(false);
        });

        it('does not hang when walking a pre-existing cyclic parent chain in the data', async () => {
            // Corrupted data: A and B already point at each other. Walking A's descendants must
            // terminate (via the visited-set guard) instead of looping forever.
            await (await db()).collection('products').insertMany(
                [
                    { group: 'Daržovės', name: 'CiklinisA', parent: 'CiklinisB' },
                    { group: 'Daržovės', name: 'CiklinisB', parent: 'CiklinisA' },
                ],
                { forceServerObjectId: true }
            );

            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'CiklinisA', parent: 'Kopūstai' }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'CiklinisA')?.parent).toBe('Kopūstai');
        });

        it('rejects a parent from a different group', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Uogienės', name: 'Braškės', parent: 'Morkos' }, session)
                )
            ).resolves.toBe(false);
        });

        it('rejects a nonexistent parent', async () => {
            await expect(
                withinTransaction((session) =>
                    setProductParent({ group: 'Daržovės', name: 'Kopūstai', parent: 'Neegzistuoja' }, session)
                )
            ).resolves.toBe(false);
        });

        it.each`
            title            | group         | name
            ${'empty group'} | ${''}         | ${'Morkos'}
            ${'empty name'}  | ${'Daržovės'} | ${''}
        `('returns false for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(
                withinTransaction((session) => setProductParent({ group, name, parent: 'Morkos' }, session))
            ).resolves.toBe(false);
        });
    });

    describe('updateProduct', () => {
        const amounts = [
            { variant: 'p', amount: 1, recycled: false },
            { variant: 'm', amount: 2 },
            { variant: 'd', amount: -1, recycled: true },
        ];

        it('updates products for existing group, name, and year', async () => {
            await expect(
                withinTransaction((session) =>
                    setAmounts({ group: 'Daržovės', name: 'Morkos', year: 22, amounts }, user, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.years.0.amounts', [
                        { variant: 'd', amount: 2 },
                        { variant: 'p', amount: 1 },
                        { variant: 'm', amount: 2 },
                    ]);
                    _.update(result, '2.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
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
                    ]);
                })
            );
        });

        it('updates products for existing group, name, and year but with different variant', async () => {
            await expect(
                withinTransaction((session) =>
                    setAmounts(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            amounts: [{ variant: 'x', amount: 1, recycled: false }],
                        },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.years.0.amounts', [
                        { variant: 'd', amount: 3 },
                        { variant: 'x', amount: 1 },
                    ]);
                    _.update(result, '2.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'x', amount: 1, recycled: false }] }],
                        },
                    ]);
                })
            );
        });

        it('updates products for existing group, name, but with 0 year for non-annual items', async () => {
            await expect(
                withinTransaction((session) =>
                    setAmounts({ group: 'Daržovės', name: 'Morkos', year: 0, amounts }, user, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.years.0.year', 0);
                    _.set(result, '2.years.0.amounts', [
                        { variant: 'd', amount: 2 },
                        { variant: 'p', amount: 1 },
                        { variant: 'm', amount: 2 },
                    ]);
                    _.update(result, '2.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
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
                    ]);
                })
            );
        });

        it('stores the given comment on the new update entry', async () => {
            await expect(
                withinTransaction((session) =>
                    setAmounts(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            amounts,
                            comment: 'Pirktas kitas kiekis',
                        },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; updates?: { comment?: string }[] }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;

            expect(morkos.updates?.at(-1)?.comment).toBe('Pirktas kitas kiekis');
        });

        it('unsets years entirely when a non-annual (year 0) update brings combined stock to zero', async () => {
            await expect(
                withinTransaction((session) =>
                    setAmounts(
                        { group: 'Daržovės', name: 'Morkos', year: 0, amounts: [{ variant: 'd', amount: -3 }] },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; years?: unknown }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;

            expect(morkos.years).toBeUndefined();
        });

        it('does not update products if no updates made', async () => {
            const bruknes = { group: 'Uogienės', name: 'Bruknės', years: [{ year: 21, amounts: [] }] };
            await (await db()).collection('products').insertOne(bruknes, { forceServerObjectId: true });

            await expect(
                withinTransaction((session) =>
                    setAmounts(
                        { group: 'Uogienės', name: 'Bruknės', year: 21, amounts: [{ variant: 'p', amount: 0 }] },
                        undefined,
                        session
                    )
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual([...products, bruknes]);
        });

        const change = { variant: 'p', amount: 1, recycled: false };

        it.each`
            title                  | group         | name         | year  | changes
            ${'invalid name'}      | ${'Uogienės'} | ${'Bruknės'} | ${22} | ${[change]}
            ${'invalid group'}     | ${'Šaldyti'}  | ${'Morkos'}  | ${22} | ${[change]}
            ${'empty group'}       | ${''}         | ${'Morkos'}  | ${22} | ${[change]}
            ${'empty name'}        | ${'Daržovės'} | ${''}        | ${22} | ${[change]}
            ${'empty changes'}     | ${'Uogienės'} | ${'Avietės'} | ${22} | ${[]}
            ${'undefined changes'} | ${'Uogienės'} | ${'Avietės'} | ${22} | ${undefined}
        `(
            'does not update products for $title',
            async ({ group, name, year, changes }: { group: string; name: string; year: number; changes: any }) => {
                await expect(
                    withinTransaction((session) =>
                        setAmounts({ group, name, year, amounts: changes }, undefined, session)
                    )
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );

        it('removes missing flag when missing and negative update received', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.unset(result, '1.missing');
                    _.set(result, '1.years.0.amounts.0.amount', 1);
                    _.update(result, '1.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -1, recycled: false }] }],
                        },
                    ]);
                })
            );
        });

        it('does not remove missing flag when missing and positive update received', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                        amounts: [{ variant: 'p', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '1.years.0.amounts.0.amount', 3);
                    _.update(result, '1.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] }],
                        },
                    ]);
                })
            );
        });

        it('does not remove missing flag when missing and recycled update received', async () => {
            const amount = { variant: 'p', amount: -1, recycled: true };
            await withinTransaction((session) =>
                setAmounts({ group: 'Uogienės', name: 'Braškės', year: 22, amounts: [amount] }, user, session)
            );

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '1.years.0.amounts.0.amount', 1);
                    _.update(result, '1.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        { time, user, years: [{ year: 22, amounts: [amount] }] },
                    ]);
                })
            );
        });

        it('removes missing flag when missing and recycled update received and no amount left', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Uogienės',
                        name: 'Braškės',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -2, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.unset(result, '1.missing');
                    _.unset(result, '1.years');
                    _.update(result, '1.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -2, recycled: false }] }],
                        },
                    ]);
                })
            );
        });
    });

    describe('transferAmounts', () => {
        it('moves amounts between products in the same category', async () => {
            await expect(
                withinTransaction((session) =>
                    transferAmounts(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            targetGroup: 'Daržovės',
                            targetName: 'Kopūstai',
                            amounts: [{ variant: 'd', amount: 2 }],
                        },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            expect(
                all.find((product) => product.group === 'Daržovės' && product.name === 'Morkos')?.years
            ).toContainEqual({
                year: 22,
                amounts: [{ variant: 'd', amount: 1 }],
            });

            expect(
                all.find((product) => product.group === 'Daržovės' && product.name === 'Kopūstai')?.years
            ).toContainEqual({
                year: 22,
                amounts: [{ variant: 'd', amount: 2 }],
            });
        });

        it('rejects amounts that exceed the source balance', async () => {
            await expect(
                withinTransaction((session) =>
                    transferAmounts(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            targetGroup: 'Daržovės',
                            targetName: 'Kopūstai',
                            amounts: [
                                { variant: 'd', amount: 2 },
                                { variant: 'd', amount: 2 },
                            ],
                        },
                        user,
                        session
                    )
                )
            ).resolves.toBe(false);
        });

        it('copies selected variants before moving them to another category', async () => {
            await expect(
                withinTransaction((session) =>
                    transferAmounts(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            targetGroup: 'Uogienės',
                            targetName: 'Avietės',
                            amounts: [{ variant: 'd', amount: 2 }],
                        },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            expect(copyVariants).toHaveBeenCalledWith('Daržovės', 'Uogienės', ['d'], expect.anything());
            expect(
                all.find((product) => product.group === 'Uogienės' && product.name === 'Avietės')?.years
            ).toContainEqual({
                year: 22,
                amounts: [{ variant: 'd', amount: 2 }],
            });
        });
    });

    describe('moveConsumedToRecycled', () => {
        it('returns false and makes no changes for a non-existent product', async () => {
            await expect(
                withinTransaction((session) =>
                    moveConsumedToRecycled(
                        { group: 'Daržovės', name: 'Neegzistuoja', year: 22, variant: 'd', amount: 2, flags: {} },
                        undefined,
                        session
                    )
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('appends a new entry with a positive consumed line and a matching negative recycled line, leaving old history and current balance untouched', async () => {
            await expect(
                withinTransaction((session) =>
                    moveConsumedToRecycled(
                        { group: 'Daržovės', name: 'Morkos', year: 22, variant: 'd', amount: 2, flags: {} },
                        user,
                        session
                    )
                )
            ).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                _.update(_.cloneDeep(products), '2.updates', (items: unknown[] | undefined) => [
                    ...(items ?? []),
                    {
                        time,
                        user,
                        years: [
                            {
                                year: 22,
                                amounts: [
                                    { variant: 'd', amount: 2, recycled: false },
                                    { variant: 'd', amount: -2, recycled: true },
                                ],
                            },
                        ],
                    },
                ])
            );
        });

        it('carries suspicious/home/expiresAt flags through onto both lines', async () => {
            await expect(
                withinTransaction((session) =>
                    moveConsumedToRecycled(
                        {
                            group: 'Daržovės',
                            name: 'Morkos',
                            year: 22,
                            variant: 'd',
                            amount: 1,
                            flags: { suspicious: true, home: true, expiresAt: 100 },
                        },
                        undefined,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { updates: { years: { amounts: unknown[] }[] }[] }[];

            expect(all[2].updates.at(-1)?.years[0].amounts).toStrictEqual([
                { variant: 'd', amount: 1, recycled: false, suspicious: true, home: true, expiresAt: 100 },
                { variant: 'd', amount: -1, recycled: true, suspicious: true, home: true, expiresAt: 100 },
            ]);
        });

        it('clears undates so a stale redo cannot be applied afterwards', async () => {
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            await expect(
                withinTransaction((session) =>
                    moveConsumedToRecycled(
                        { group: 'Daržovės', name: 'Morkos', year: 22, variant: 'd', amount: 1, flags: {} },
                        undefined,
                        session
                    )
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { undates?: unknown[] }[];

            expect(all[2].undates).toBeUndefined();
        });

        it.each`
            title                | group         | name        | variant | amount
            ${'empty group'}     | ${''}         | ${'Morkos'} | ${'d'}  | ${1}
            ${'empty name'}      | ${'Daržovės'} | ${''}       | ${'d'}  | ${1}
            ${'empty variant'}   | ${'Daržovės'} | ${'Morkos'} | ${''}   | ${1}
            ${'zero amount'}     | ${'Daržovės'} | ${'Morkos'} | ${'d'}  | ${0}
            ${'negative amount'} | ${'Daržovės'} | ${'Morkos'} | ${'d'}  | ${-1}
        `(
            'returns false and makes no changes for $title',
            async ({
                group,
                name,
                variant,
                amount,
            }: {
                group: string;
                name: string;
                variant: string;
                amount: number;
            }) => {
                await expect(
                    withinTransaction((session) =>
                        moveConsumedToRecycled(
                            { group, name, year: 22, variant, amount, flags: {} },
                            undefined,
                            session
                        )
                    )
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('undoProduct', () => {
        it('returns false for empty group or name', async () => {
            await expect(
                withinTransaction((session) => undoProduct({ group: '', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(false);
            await expect(
                withinTransaction((session) => undoProduct({ group: 'Daržovės', name: '', year: 22 }, session))
            ).resolves.toBe(false);
        });

        it('returns false when product has no updates for that year', async () => {
            await expect(
                withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Kopūstai', year: 21 }, session))
            ).resolves.toBe(false);
        });

        it('undoes a consumed update', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            await expect($all('products')).resolves.toStrictEqual(
                _.set(_.cloneDeep(products), '2.undates', [
                    {
                        time,
                        user,
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
                    },
                ])
            );
        });

        it('reverts inventory changes when undoing', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: -3, recycled: false }],
                    },
                    user,
                    session
                )
            );

            const beforeUndo = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            // inventory hits 0 so year entry is removed
            expect(beforeUndo[2].years).toBeUndefined();

            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            const afterUndo = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            expect(afterUndo[2].years?.[0].amounts[0].amount).toBe(3);
        });

        it('moves last update to undates', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 2, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const morkos = all[2];

            expect(morkos.undates).toHaveLength(1);
            expect(morkos.updates).toHaveLength(2);
        });

        it('stacks multiple undos correctly', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const morkos = all[2];

            expect(morkos.undates).toHaveLength(2);
            expect(morkos.updates).toHaveLength(2);
        });

        it('clears year entry when undo brings inventory to zero', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Kopūstai',
                        year: 21,
                        amounts: [{ variant: 'p', amount: 2, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Kopūstai',
                        year: 21,
                        amounts: [{ variant: 'p', amount: -4, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) =>
                undoProduct({ group: 'Daržovės', name: 'Kopūstai', year: 21 }, session)
            );

            const all = (await $all('products')) as { years?: { year: number }[]; updates?: unknown[] }[];
            const kopustai = all[3];

            expect(kopustai.years?.find((y) => y.year === 21)).toBeDefined();
        });

        it('undoes a recycled update', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: -3, recycled: true }],
                    },
                    user,
                    session
                )
            );
            const afterUpdate = (await $all('products')) as {
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            // inventory hits 0 so year entry is removed
            expect(afterUpdate[2].years).toBeUndefined();

            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            expect(afterUndo).toBe(3);
        });

        it('undoes an updated (no recycled field) entry', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    { group: 'Daržovės', name: 'Morkos', year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                    user,
                    session
                )
            );
            const afterUpdate = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            expect(afterUpdate).toBe(5);
            expect(afterUndo).toBe(3);
        });

        it('pulls just that year out of years when undo zeroes out an annual product that also has other years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Morkos' },
                {
                    $set: {
                        years: [
                            { year: 21, amounts: [{ variant: 'd', amount: 9 }] },
                            { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                        ],
                        updates: [
                            {
                                time: Date.now(),
                                user,
                                years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                            },
                        ],
                    },
                    $unset: { undates: 1 },
                }
            );

            await expect(
                withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 21, amounts: [{ variant: 'd', amount: 9 }] }]);
        });

        describe('non-annual item (year 0, combined amounts)', () => {
            it('replaces the whole combined years entry when stock remains after undo', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Morkos' },
                    {
                        $set: {
                            years: [{ year: 0, amounts: [{ variant: 'd', amount: 5 }] }],
                            updates: [
                                {
                                    time: Date.now(),
                                    user,
                                    years: [{ year: 0, amounts: [{ variant: 'd', amount: -2, recycled: false }] }],
                                },
                            ],
                        },
                        $unset: { undates: 1 },
                    }
                );

                await expect(
                    withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 0 }, session))
                ).resolves.toBe(true);

                const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

                expect(all[2].years).toStrictEqual([{ year: 0, amounts: [{ variant: 'd', amount: 7 }] }]);
            });

            it('unsets years entirely when undo brings combined stock to zero', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Morkos' },
                    {
                        $set: {
                            years: [{ year: 0, amounts: [{ variant: 'd', amount: 2 }] }],
                            updates: [
                                {
                                    time: Date.now(),
                                    user,
                                    years: [{ year: 0, amounts: [{ variant: 'd', amount: 2 }] }],
                                },
                            ],
                        },
                        $unset: { undates: 1 },
                    }
                );

                await expect(
                    withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 0 }, session))
                ).resolves.toBe(true);

                const all = (await $all('products')) as { years?: unknown }[];

                expect(all[2].years).toBeUndefined();
            });
        });
    });

    describe('redoProduct', () => {
        it('returns false for empty group or name', async () => {
            await expect(
                withinTransaction((session) => redoProduct({ group: '', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(false);
            await expect(
                withinTransaction((session) => redoProduct({ group: 'Daržovės', name: '', year: 22 }, session))
            ).resolves.toBe(false);
        });

        it('returns false when product has no undates for that year', async () => {
            await expect(
                withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Kopūstai', year: 21 }, session))
            ).resolves.toBe(false);
        });

        it('redoes last undone update', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 2, recycled: false }],
                    },
                    user,
                    session
                )
            );
            const afterUpdate = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            const afterUndo = (
                (await $all('products')) as {
                    years?: { year: number; amounts: { variant: string; amount: number }[] }[];
                }[]
            )[2].years?.[0].amounts[0].amount;

            await withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
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
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 2, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const beforeRedo = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(beforeRedo[2].updates).toHaveLength(2);
            expect(beforeRedo[2].undates).toHaveLength(1);

            await withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const afterRedo = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(afterRedo[2].updates).toHaveLength(3);
            expect(afterRedo[2].undates).toBeUndefined();
        });

        it('redoes multiple undos in correct order (LIFO)', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            await withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            await withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const morkos = all[2];

            expect(morkos.updates).toHaveLength(4);
            expect(morkos.undates).toBeUndefined();
        });

        it('new update clears undates, making redo impossible', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect(
                withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(false);

            const all = (await $all('products')) as { undates?: unknown[] }[];

            expect(all[2].undates).toBeUndefined();
        });

        it('undo on fixture product with pre-existing updates leaves undates with one entry', async () => {
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];

            expect(all[2].updates).toHaveLength(1);
            expect(all[2].undates).toHaveLength(1);
        });

        it('pulls just that year out of years when redo zeroes out an annual product that also has other years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Morkos' },
                {
                    $set: {
                        years: [
                            { year: 21, amounts: [{ variant: 'd', amount: 9 }] },
                            { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                        ],
                        undates: [
                            {
                                time: Date.now(),
                                user,
                                years: [{ year: 22, amounts: [{ variant: 'd', amount: -2, recycled: false }] }],
                            },
                        ],
                    },
                }
            );

            await expect(
                withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 21, amounts: [{ variant: 'd', amount: 9 }] }]);
        });

        it('pushes a new year entry when redo applies to a year currently missing from years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Morkos' },
                {
                    $unset: { years: 1 },
                    $set: {
                        undates: [
                            {
                                time: Date.now(),
                                user,
                                years: [{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }],
                            },
                        ],
                    },
                }
            );

            await expect(
                withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session))
            ).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }]);
        });

        describe('non-annual item (year 0, combined amounts)', () => {
            it('replaces the whole combined years entry when stock remains after redo', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Morkos' },
                    {
                        $set: {
                            years: [{ year: 0, amounts: [{ variant: 'd', amount: 5 }] }],
                            undates: [
                                {
                                    time: Date.now(),
                                    user,
                                    years: [{ year: 0, amounts: [{ variant: 'd', amount: -2, recycled: false }] }],
                                },
                            ],
                        },
                    }
                );

                await expect(
                    withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 0 }, session))
                ).resolves.toBe(true);

                const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

                expect(all[2].years).toStrictEqual([{ year: 0, amounts: [{ variant: 'd', amount: 3 }] }]);
            });

            it('unsets years entirely when redo brings combined stock to zero', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Morkos' },
                    {
                        $set: {
                            years: [{ year: 0, amounts: [{ variant: 'd', amount: 2 }] }],
                            undates: [
                                {
                                    time: Date.now(),
                                    user,
                                    years: [{ year: 0, amounts: [{ variant: 'd', amount: -2, recycled: false }] }],
                                },
                            ],
                        },
                    }
                );

                await expect(
                    withinTransaction((session) => redoProduct({ group: 'Daržovės', name: 'Morkos', year: 0 }, session))
                ).resolves.toBe(true);

                const all = (await $all('products')) as { years?: unknown }[];

                expect(all[2].years).toBeUndefined();
            });
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
            await expect(
                withinTransaction((session) =>
                    renameProduct({ group: 'Daržovės', name: 'Morkos', targetName: 'Z' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '2.name', 'Z'));
        });

        it('renames products for different group', async () => {
            await expect(
                withinTransaction((session) =>
                    renameProduct({ group: 'Uogienės', name: 'Avietės', targetName: 'Agrastai' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '0.name', 'Agrastai'));
        });

        it.each`
            title               | group         | name         | targetName
            ${'invalid group'}  | ${'Šaldyti'}  | ${'Krapai'}  | ${'Krabai'}
            ${'invalid name'}   | ${'Daržovės'} | ${'Burokai'} | ${'Runkeliai'}
            ${'same names'}     | ${'Uogienės'} | ${'Avietės'} | ${'Avietės'}
            ${'empty group'}    | ${''}         | ${'Krapai'}  | ${'Krabai'}
            ${'empty name'}     | ${'Šaldyti'}  | ${''}        | ${'Krabai'}
            ${'empty new name'} | ${'Šaldyti'}  | ${'Krapai'}  | ${''}
        `(
            'does not rename products for $title',
            async ({ group, name, targetName }: { group: string; name: string; targetName: string }) => {
                await expect(
                    withinTransaction((session) => renameProduct({ group, name, targetName }, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );

        it('reports duplicate names without altering either product or child references', async () => {
            await expect(
                withinTransaction((session) =>
                    renameProduct({ group: 'Uogienės', name: 'Avietės', targetName: 'Braškės' }, session)
                )
            ).rejects.toThrow(SchemaError.NameAlreadyExists);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it("cascades the rename to children's parent field", async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );

            await expect(
                withinTransaction((session) =>
                    renameProduct({ group: 'Daržovės', name: 'Morkos', targetName: 'Agurkėliai' }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos (Zewa)')?.parent).toBe('Agurkėliai');
        });

        it("does not affect other groups' or products' parent fields", async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );

            await expect(
                withinTransaction((session) =>
                    renameProduct({ group: 'Uogienės', name: 'Avietės', targetName: 'Agrastai' }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos (Zewa)')?.parent).toBe('Morkos');
        });
    });

    describe('renameProductVariant', () => {
        it('renames products variant', async () => {
            await expect(
                withinTransaction((session) => renameProductsVariant('Daržovės', 'd', '3/4', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.years.0.amounts.0.variant', '3/4');
                    _.set(result, '2.updates.0.years.0.amounts.1.variant', '3/4');
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

            await expect(
                withinTransaction((session) => renameProductsVariant('Daržovės', 'd', '3/4', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep([...products, d]), (result) => {
                    _.set(result, '2.years.0.amounts.0.variant', '3/4');
                    _.set(result, '2.updates.0.years.0.amounts.1.variant', '3/4');
                    _.set(result, '4.years.1.amounts.0.variant', '3/4');
                    _.set(result, '4.years.2.amounts.0.variant', '3/4');
                    _.set(result, '4.updates.0.years.1.amounts.0.variant', '3/4');
                    _.set(result, '4.updates.0.years.2.amounts.0.variant', '3/4');
                })
            );
        });

        it('renames products variant for different group', async () => {
            await expect(
                withinTransaction((session) => renameProductsVariant('Uogienės', 'p', '1/2', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '0.years.0.amounts.0.variant', '1/2');
                    _.set(result, '0.updates.0.years.0.amounts.0.variant', '1/2');
                    _.set(result, '0.updates.0.years.1.amounts.0.variant', '1/2');
                    _.set(result, '0.updates.1.years.0.amounts.0.variant', '1/2');
                    _.set(result, '0.updates.1.years.1.amounts.0.variant', '1/2');
                    _.set(result, '0.updates.2.years.0.amounts.0.variant', '1/2');
                    _.set(result, '1.years.0.amounts.0.variant', '1/2');
                    _.set(result, '1.updates.0.years.0.amounts.0.variant', '1/2');
                    _.set(result, '1.updates.1.years.0.amounts.0.variant', '1/2');
                    _.set(result, '1.updates.2.years.0.amounts.0.variant', '1/2');
                })
            );
        });

        it('renames products variant on second year', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Kopūstai',
                        year: 22,
                        amounts: [{ variant: 'p', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect(
                withinTransaction((session) => renameProductsVariant('Daržovės', 'p', '1/2', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.updates.0.years.0.amounts.0.variant', '1/2');
                    _.set(result, '3.years.0.amounts.0.variant', '1/2');
                    _.update(result, '3.years', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        { year: 22, amounts: [{ variant: '1/2', amount: 1 }] },
                    ]);
                    _.update(result, '3.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 22, amounts: [{ variant: '1/2', amount: 1, recycled: false }] }],
                        },
                    ]);
                })
            );
        });

        it('renames products second variant on first year', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Kopūstai',
                        year: 21,
                        amounts: [{ variant: 'd', amount: 1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            await expect(
                withinTransaction((session) => renameProductsVariant('Daržovės', 'd', '3/4', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.years.0.amounts.0.variant', '3/4');
                    _.set(result, '2.updates.0.years.0.amounts.1.variant', '3/4');
                    _.update(result, '3.years.0.amounts', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        { variant: '3/4', amount: 1 },
                    ]);
                    _.update(result, '3.updates', (items: unknown[] | undefined) => [
                        ...(items ?? []),
                        {
                            time,
                            user,
                            years: [{ year: 21, amounts: [{ variant: '3/4', amount: 1, recycled: false }] }],
                        },
                    ]);
                })
            );
        });

        it.each`
            title                  | group         | variant  | targetVariant
            ${'invalid group'}     | ${'Šaldyti'}  | ${'p'}   | ${'1/2'}
            ${'invalid variant'}   | ${'Daržovės'} | ${'0.5'} | ${'1/2'}
            ${'same variants'}     | ${'Daržovės'} | ${'p'}   | ${'p'}
            ${'empty group'}       | ${''}         | ${'p'}   | ${'b'}
            ${'empty variant'}     | ${'Daržovės'} | ${''}    | ${'b'}
            ${'empty new variant'} | ${'Daržovės'} | ${'p'}   | ${''}
        `(
            'does not rename variant for $title',
            async ({ group, variant, targetVariant }: { group: string; variant: string; targetVariant: string }) => {
                await expect(
                    withinTransaction((session) => renameProductsVariant(group, variant, targetVariant, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('renameProductGroup', () => {
        it('renames products group', async () => {
            await expect(
                withinTransaction((session) => renameProductsGroup('Daržovės', 'Šaldyti', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.group', 'Šaldyti');
                    _.set(result, '3.group', 'Šaldyti');
                })
            );
        });

        it('renames different group', async () => {
            await expect(
                withinTransaction((session) => renameProductsGroup('Uogienės', 'Šaldyti', session))
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '0.group', 'Šaldyti');
                    _.set(result, '1.group', 'Šaldyti');
                })
            );
        });

        it.each`
            title              | group         | targetGroup
            ${'invalid group'} | ${'Šaldyti'}  | ${'Uogienės'}
            ${'same groups'}   | ${'Daržovės'} | ${'Daržovės'}
            ${'empty group'}   | ${''}         | ${'Daržovės'}
            ${'empty variant'} | ${'Daržovės'} | ${''}
        `(
            'does not rename group for $title',
            async ({ group, targetGroup }: { group: string; targetGroup: string }) => {
                await expect(
                    withinTransaction((session) => renameProductsGroup(group, targetGroup, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('moveProduct', () => {
        it('moves products', async () => {
            await expect(
                withinTransaction((session) =>
                    moveProduct({ group: 'Daržovės', name: 'Morkos', targetGroup: 'Šaldyti' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '2.group', 'Šaldyti'));
        });

        it('moves products from different group', async () => {
            await expect(
                withinTransaction((session) =>
                    moveProduct({ group: 'Uogienės', name: 'Avietės', targetGroup: 'Šaldyti' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '0.group', 'Šaldyti'));
        });

        it('moves products with new name', async () => {
            await expect(
                withinTransaction((session) =>
                    moveProduct(
                        { group: 'Daržovės', name: 'Morkos', targetGroup: 'Šaldyti', targetName: 'Agurkėliai' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.group', 'Šaldyti');
                    _.set(result, '2.name', 'Agurkėliai');
                })
            );
        });

        it('moves products with old name if new name is empty', async () => {
            await expect(
                withinTransaction((session) =>
                    moveProduct({ group: 'Daržovės', name: 'Morkos', targetGroup: 'Šaldyti', targetName: '' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '2.group', 'Šaldyti'));
        });

        it.each`
            title                       | group         | name         | targetGroup
            ${'invalid group'}          | ${'Šaldyti'}  | ${'Krapai'}  | ${'Uogienės'}
            ${'invalid name'}           | ${'Daržovės'} | ${'Braškės'} | ${'Šaldyti'}
            ${'same groups'}            | ${'Daržovės'} | ${'Morkos'}  | ${'Daržovės'}
            ${'same name in new group'} | ${'Uogienės'} | ${'Morkos'}  | ${'Daržovės'}
            ${'empty group'}            | ${''}         | ${'Morkos'}  | ${'Daržovės'}
            ${'empty name'}             | ${'Daržovės'} | ${''}        | ${'Šaldyti'}
            ${'empty new group'}        | ${'Daržovės'} | ${'Morkos'}  | ${''}
        `(
            'does not move products for $title',
            async ({ group, name, targetGroup }: { group: string; name: string; targetGroup: string }) => {
                await expect(
                    withinTransaction((session) => moveProduct({ group, name, targetGroup }, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );

        it('clears the parent field when moving to a different group', async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );

            await expect(
                withinTransaction((session) =>
                    moveProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', targetGroup: 'Šaldyti' }, session)
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];
            const moved = all.find((p) => p.group === 'Šaldyti' && p.name === 'Morkos (Zewa)');

            expect(moved?.parent).toBeUndefined();
        });
    });

    describe('deleteProduct', () => {
        afterEach(() => vi.clearAllMocks());

        it('archives products without removing their history', async () => {
            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).resolves.toBe(true);
            expect((await $all('products')).find((p) => p.group === 'Daržovės' && p.name === 'Morkos')).toMatchObject({
                archivedAt: expect.any(Number),
                years: products[2]?.years,
                updates: products[2]?.updates,
            });
        });

        it('archives products from a different group', async () => {
            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Uogienės', name: 'Avietės' }, session))
            ).resolves.toBe(true);
            expect((await $all('products')).find((p) => p.group === 'Uogienės' && p.name === 'Avietės')).toMatchObject({
                archivedAt: expect.any(Number),
                years: products[0]?.years,
                updates: products[0]?.updates,
            });
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Krapai'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'}
            ${'empty group'}   | ${''}         | ${'Morkos'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does not delete products for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(withinTransaction((session) => deleteProduct({ group, name }, session))).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('keeps the image file for an archived product', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
            );
            vi.clearAllMocks();

            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not touch image files when the product has no image', async () => {
            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('keeps all variant image files for an archived product', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/d.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/p.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'p', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();

            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not delete a product that has children', async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );
            vi.clearAllMocks();

            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Morkos' }, session))
            ).resolves.toBe(false);

            expect(deleteImages).not.toHaveBeenCalled();

            const all = (await $all('products')) as { group: string; name: string }[];

            expect(all.some((p) => p.group === 'Daržovės' && p.name === 'Morkos')).toBe(true);
        });

        it('archives a childless product even when other unrelated products have children', async () => {
            await withinTransaction((session) =>
                addProduct({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' }, session)
            );

            await expect(
                withinTransaction((session) => deleteProduct({ group: 'Daržovės', name: 'Kopūstai' }, session))
            ).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string }[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Kopūstai')).toMatchObject({
                archivedAt: expect.any(Number),
            });
        });
    });

    describe('setImage', () => {
        afterEach(() => vi.clearAllMocks());

        it('uploads a new image, classifies it, and stores it', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await expect(
                withinTransaction((session) =>
                    setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
                )
            ).resolves.toBe(true);

            expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
            expect(classifyImage).toHaveBeenCalledWith('/images/ab/cd/new-image.png');
            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                _.set(_.cloneDeep(products), '2.image', '/images/ab/cd/new-image.png')
            );
        });

        it('classifies a photo-sized upload, storing both the thumbnail and the photo', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/saved.png');
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/saved.png',
            });

            await expect(
                withinTransaction((session) =>
                    setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
                )
            ).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.image', '/images/ab/cd/thumb.png');
                    _.set(result, '2.photo', '/images/ab/cd/saved.png');
                })
            );
        });

        it('deletes the previous image file(s) when replacing it', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
            );
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
            );

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
        });

        it('deletes the image file when the image is removed', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
            );
            vi.clearAllMocks();

            await withinTransaction((session) => setImage({ group: 'Daržovės', name: 'Morkos', image: '' }, session));

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not touch image files when the image is unchanged', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: 'data:image/png;base64,AAA' }, session)
            );
            vi.clearAllMocks();

            await withinTransaction((session) =>
                setImage({ group: 'Daržovės', name: 'Morkos', image: '/images/same/same.png' }, session)
            );

            expect(saveImage).not.toHaveBeenCalled();
            expect(deleteImages).not.toHaveBeenCalled();
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Morkos'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'}
            ${'empty group'}   | ${''}         | ${'Morkos'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does nothing for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(
                withinTransaction((session) => setImage({ group, name, image: 'data:image/png;base64,AAA' }, session))
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setVariantImage', () => {
        afterEach(() => vi.clearAllMocks());

        it('uploads a new image, classifies it, and stores it under the variant key', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await expect(
                withinTransaction((session) =>
                    setVariantImage(
                        { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                        session
                    )
                )
            ).resolves.toBe(true);

            expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                _.set(_.cloneDeep(products), '2.variantImages.d', '/images/ab/cd/new-image.png')
            );
        });

        it('classifies a photo-sized variant upload, storing both the thumbnail and the photo', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/saved.png');
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/saved.png',
            });

            await expect(
                withinTransaction((session) =>
                    setVariantImage(
                        { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                        session
                    )
                )
            ).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.variantImages.d', '/images/ab/cd/thumb.png');
                    _.set(result, '2.variantPhotos.d', '/images/ab/cd/saved.png');
                })
            );
        });

        it('deletes the previous image file(s) when replacing it', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
        });

        it('deletes the image file when the image is removed', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();

            await withinTransaction((session) =>
                setVariantImage({ group: 'Daržovės', name: 'Morkos', variant: 'd', image: '' }, session)
            );

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '2.variantImages', {}));
        });

        it('does not touch image files when the image is unchanged', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();

            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: '/images/same/same.png' },
                    session
                )
            );

            expect(saveImage).not.toHaveBeenCalled();
            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('keeps images for different variants of the same product independent', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/d.png');
            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'd', image: 'data:image/png;base64,AAA' },
                    session
                )
            );
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/p.png');

            await withinTransaction((session) =>
                setVariantImage(
                    { group: 'Daržovės', name: 'Morkos', variant: 'p', image: 'data:image/png;base64,AAA' },
                    session
                )
            );

            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '2.variantImages.d', '/images/old/d.png');
                    _.set(result, '2.variantImages.p', '/images/ab/cd/p.png');
                })
            );
        });

        it.each`
            title              | group         | name         | variant
            ${'invalid group'} | ${'Šaldyti'}  | ${'Morkos'}  | ${'d'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'} | ${'d'}
            ${'empty group'}   | ${''}         | ${'Morkos'}  | ${'d'}
            ${'empty name'}    | ${'Daržovės'} | ${''}        | ${'d'}
            ${'empty variant'} | ${'Daržovės'} | ${'Morkos'}  | ${''}
        `(
            'does nothing for $title',
            async ({ group, name, variant }: { group: string; name: string; variant: string }) => {
                await expect(
                    withinTransaction((session) =>
                        setVariantImage({ group, name, variant, image: 'data:image/png;base64,AAA' }, session)
                    )
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('deleteProductVariant', () => {
        it('does not remove embedded variant history', async () => {
            await expect(withinTransaction((session) => deleteProductsVariant('Daržovės', 'p', session))).resolves.toBe(
                false
            );
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it.each`
            title                | group         | variant
            ${'invalid group'}   | ${'Šaldyti'}  | ${'p'}
            ${'invalid variant'} | ${'Daržovės'} | ${'0.5'}
            ${'empty group'}     | ${''}         | ${'Morkos'}
            ${'empty variant'}   | ${'Daržovės'} | ${''}
        `('does not delete variant for $title', async ({ group, variant }: { group: string; variant: string }) => {
            await expect(withinTransaction((session) => deleteProductsVariant(group, variant, session))).resolves.toBe(
                false
            );
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('deleteProductGroup', () => {
        it('does not remove products when a category is archived', async () => {
            await expect(withinTransaction((session) => deleteProductsGroup('Daržovės', session))).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it.each`
            title              | group
            ${'invalid group'} | ${'Šaldyti'}
            ${'empty group'}   | ${''}
        `('does not delete variant for $title', async ({ group }: { group: string }) => {
            await expect(withinTransaction((session) => deleteProductsGroup(group, session))).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setRemoving', () => {
        it('sets removing by group, name, and year', async () => {
            await expect(
                withinTransaction((session) =>
                    setRemoving({ group: 'Daržovės', name: 'Morkos', year: 22, removing: true }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.set(_.cloneDeep(products), '2.years.0.removing', true)
            );
        });

        it('sets removing by different group, name, and year', async () => {
            await expect(
                withinTransaction((session) =>
                    setRemoving({ group: 'Uogienės', name: 'Braškės', year: 22, removing: true }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.set(_.cloneDeep(products), '1.years.0.removing', true)
            );
        });

        it('sets not removing by group, name, and year', async () => {
            await expect(
                withinTransaction((session) =>
                    setRemoving({ group: 'Daržovės', name: 'Kopūstai', year: 21, removing: false }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.update(_.cloneDeep(products), '3.years.0', (year) => _.omit(year, 'removing'))
            );
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
                await expect(
                    withinTransaction((session) => setRemoving({ group, name, year, removing }, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('setMissing', () => {
        it('sets missing item', async () => {
            await expect(
                withinTransaction((session) =>
                    setMissing({ group: 'Uogienės', name: 'Avietės', missing: true }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(_.set(_.cloneDeep(products), '0.missing', true));
        });

        it('unsets missing item', async () => {
            await expect(
                withinTransaction((session) =>
                    setMissing({ group: 'Uogienės', name: 'Braškės', missing: false }, session)
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.update(_.cloneDeep(products), '1', (product) => _.omit(product, 'missing'))
            );
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
                await expect(
                    withinTransaction((session) => setMissing({ group, name, missing }, session))
                ).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('setMissingBulk', () => {
        it('sets and unsets missing for multiple products in one call', async () => {
            await expect(
                withinTransaction((session) =>
                    setMissingBulk(
                        {
                            updates: [
                                { group: 'Uogienės', name: 'Avietės', missing: true },
                                { group: 'Uogienės', name: 'Braškės', missing: false },
                            ],
                        },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                _.tap(_.cloneDeep(products), (result) => {
                    _.set(result, '0.missing', true);
                    _.unset(result, '1.missing');
                })
            );
        });

        it('does nothing for an empty list', async () => {
            await expect(withinTransaction((session) => setMissingBulk({ updates: [] }, session))).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does nothing when nothing actually changes', async () => {
            await expect(
                withinTransaction((session) =>
                    setMissingBulk(
                        {
                            updates: [
                                { group: 'Uogienės', name: 'Avietės', missing: false },
                                { group: 'Uogienės', name: 'Braškės', missing: true },
                            ],
                        },
                        session
                    )
                )
            ).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('cleanupRecycled', () => {
        it('preserves suspicious flag', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, suspicious: true })).toStrictEqual({
                variant: 'p',
                amount: 1,
                suspicious: true,
            });
        });

        it('does not include suspicious when false', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, suspicious: false })).toStrictEqual({
                variant: 'p',
                amount: 1,
            });
        });

        it('preserves home flag', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, home: true })).toStrictEqual({
                variant: 'p',
                amount: 1,
                home: true,
            });
        });

        it('does not include home when false', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, home: false })).toStrictEqual({
                variant: 'p',
                amount: 1,
            });
        });

        it('preserves recycled flag when present', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, recycled: false })).toStrictEqual({
                variant: 'p',
                amount: 1,
                recycled: false,
            });
        });

        it('drops recycled when undefined', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, recycled: undefined })).toStrictEqual({
                variant: 'p',
                amount: 1,
            });
        });

        it('preserves all flags together', () => {
            expect(
                cleanupRecycled({ variant: 'p', amount: 2, recycled: true, suspicious: true, home: true })
            ).toStrictEqual({
                variant: 'p',
                amount: 2,
                recycled: true,
                suspicious: true,
                home: true,
            });
        });

        it('preserves expiresAt when present', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, expiresAt: 1_700_000_000_000 })).toStrictEqual({
                variant: 'p',
                amount: 1,
                expiresAt: 1_700_000_000_000,
            });
        });

        it('does not include expiresAt when undefined', () => {
            expect(cleanupRecycled({ variant: 'p', amount: 1, expiresAt: undefined })).toStrictEqual({
                variant: 'p',
                amount: 1,
            });
        });
    });

    describe('updateProduct with suspicious amounts', () => {
        it('stores suspicious flag in history amounts', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: -1, recycled: false, suspicious: true }],
                    },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                updates?: {
                    years: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
                }[];
            }[];
            const morkos = all[2];
            const lastUpdate = morkos.updates![morkos.updates!.length - 1];
            const historyAmount = lastUpdate.years[0].amounts[0];

            expect(historyAmount.suspicious).toBe(true);
        });

        it('stores suspicious flag in years.amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Morkos' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Morkos' }, { forceServerObjectId: true });

            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 3, suspicious: true }],
                    },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
            }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const yearEntry = morkos.years?.find((y) => y.year === 22);

            expect(yearEntry?.amounts.find((a) => a.variant === 'd' && a.suspicious)).toBeDefined();
        });

        it('does NOT merge suspicious and non-suspicious amounts for same variant', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Morkos' });
            await (await db()).collection('products').insertOne(
                {
                    group: 'Daržovės',
                    name: 'Morkos',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                },
                { forceServerObjectId: true }
            );

            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: 3, suspicious: true }],
                    },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
            }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const amounts = morkos.years?.find((y) => y.year === 22)?.amounts ?? [];

            // non-suspicious and suspicious are separate entries
            expect(amounts.filter((a) => a.variant === 'd')).toHaveLength(2);
            expect(amounts.find((a) => a.variant === 'd' && !a.suspicious)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'd' && a.suspicious)?.amount).toBe(3);
        });
    });

    describe('updateProduct with home amounts', () => {
        it('stores home flag in history amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Morkos' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Morkos' }, { forceServerObjectId: true });

            await withinTransaction((session) =>
                setAmounts(
                    { group: 'Daržovės', name: 'Morkos', year: 22, amounts: [{ variant: 'd', amount: 5, home: true }] },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                updates?: {
                    years: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
                }[];
            }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const lastUpdate = morkos.updates![morkos.updates!.length - 1];
            const historyAmount = lastUpdate.years[0].amounts[0];

            expect(historyAmount.home).toBe(true);
        });

        it('stores home flag in years.amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Morkos' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Morkos' }, { forceServerObjectId: true });

            await withinTransaction((session) =>
                setAmounts(
                    { group: 'Daržovės', name: 'Morkos', year: 22, amounts: [{ variant: 'd', amount: 5, home: true }] },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
            }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const yearEntry = morkos.years?.find((y) => y.year === 22);

            expect(yearEntry?.amounts.find((a) => a.variant === 'd' && a.home)).toBeDefined();
        });

        it('does NOT merge home and non-home amounts for same variant', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Morkos' });
            await (await db()).collection('products').insertOne(
                {
                    group: 'Daržovės',
                    name: 'Morkos',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                },
                { forceServerObjectId: true }
            );

            await withinTransaction((session) =>
                setAmounts(
                    { group: 'Daržovės', name: 'Morkos', year: 22, amounts: [{ variant: 'd', amount: 3, home: true }] },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
            }[];
            const morkos = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const amounts = morkos.years?.find((y) => y.year === 22)?.amounts ?? [];

            // non-home and home are separate entries
            expect(amounts.filter((a) => a.variant === 'd')).toHaveLength(2);
            expect(amounts.find((a) => a.variant === 'd' && !a.home)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'd' && a.home)?.amount).toBe(3);
        });
    });

    describe('auto-consume home balance on first cellar consume', () => {
        const homeProduct = {
            group: 'Šaldyti',
            name: 'Mėsa',
            years: [
                {
                    year: 22,
                    amounts: [
                        { variant: 'p', amount: 3 },
                        { variant: 'p', amount: 5, home: true },
                    ],
                },
            ],
        };

        beforeEach(async () => {
            await (await db()).collection('products').insertOne({ ...homeProduct }, { forceServerObjectId: true });
        });

        it('auto-consumes home balance when cellar consume arrives for variant with home amounts', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Šaldyti',
                        name: 'Mėsa',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            const result = await withinTransaction((session) => getProducts([22], session));
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            // cellar: 3 - 1 = 2, home: 5 - 5 (auto-consumed) = 0 → removed
            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'p' && a.home)).toBeUndefined();
        });

        it('auto-consume is saved in update history', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Šaldyti',
                        name: 'Mėsa',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                updates?: {
                    years: {
                        year: number;
                        amounts: { variant: string; amount: number; recycled?: boolean; home?: boolean }[];
                    }[];
                }[];
            }[];
            const product = all.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const lastUpdate = product.updates![product.updates!.length - 1];
            const amounts = lastUpdate.years.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.find((a) => a.variant === 'p' && a.recycled === false && !a.home)?.amount).toBe(-1);
            expect(amounts.find((a) => a.variant === 'p' && a.recycled === false && a.home)?.amount).toBe(-5);
        });

        it('does NOT auto-consume when home consume arrives (only cellar triggers it)', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Šaldyti',
                        name: 'Mėsa',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: false, home: true }],
                    },
                    user,
                    session
                )
            );

            const result = await withinTransaction((session) => getProducts([22], session));
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            // home manually consumed by 1, cellar unchanged
            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(3);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(4);
        });

        it('does NOT auto-consume for recycled:true (thrown away)', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Šaldyti',
                        name: 'Mėsa',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: true }],
                    },
                    user,
                    session
                )
            );

            const result = await withinTransaction((session) => getProducts([22], session));
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(5);
        });

        it('does NOT auto-consume when variant has no home amounts', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        amounts: [{ variant: 'd', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );

            const all = (await $all('products')) as {
                group: string;
                name: string;
                updates?: { years: { year: number; amounts: { variant: string; home?: boolean }[] }[] }[];
            }[];
            const product = all.find((p) => p.group === 'Daržovės' && p.name === 'Morkos')!;
            const lastUpdate = product.updates![product.updates!.length - 1];
            const amounts = lastUpdate.years.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.filter((a) => a.home)).toHaveLength(0);
        });

        it('undo restores both cellar and auto-consumed home amounts', async () => {
            await withinTransaction((session) =>
                setAmounts(
                    {
                        group: 'Šaldyti',
                        name: 'Mėsa',
                        year: 22,
                        amounts: [{ variant: 'p', amount: -1, recycled: false }],
                    },
                    user,
                    session
                )
            );
            await withinTransaction((session) => undoProduct({ group: 'Šaldyti', name: 'Mėsa', year: 22 }, session));

            const result = await withinTransaction((session) => getProducts([22], session));
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(3);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(5);
        });
    });

    it('rolls back the source stock when the target write has no effect', async () => {
        const database = await db();
        const collection = database.collection('products');
        const targetDatabase = {
            ...database,
            collection: () => ({ ...collection, bulkWrite: vi.fn(async () => ({ modifiedCount: 0 })) }),
        };
        vi.mocked(db)
            .mockResolvedValueOnce(database)
            .mockResolvedValueOnce(database)
            .mockResolvedValueOnce(targetDatabase as never);

        await expect(
            withinTransaction((session) =>
                transferAmounts(
                    {
                        group: 'Daržovės',
                        name: 'Morkos',
                        year: 22,
                        targetGroup: 'Daržovės',
                        targetName: 'Kopūstai',
                        amounts: [{ variant: 'd', amount: 1 }],
                    },
                    'session@example.com',
                    session
                )
            )
        ).rejects.toThrow(SchemaError.RequestFailed);
        await expect($all('products')).resolves.toStrictEqual(products);
    });

    describe('getProductUpdates and getProductUndates', () => {
        it('returns update history entries for the given product and year', async () => {
            const result = await withinTransaction((session) =>
                getProductUpdates({ group: 'Daržovės', name: 'Morkos', year: 22 }, session)
            );

            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Daržovės' && e.name === 'Morkos' && e.year === 22)).toBe(true);
        });

        it('returns empty array when product has no updates for that year', async () => {
            await expect(
                withinTransaction((session) =>
                    getProductUpdates({ group: 'Daržovės', name: 'Kopūstai', year: 22 }, session)
                )
            ).resolves.toStrictEqual([]);
        });

        it('returns empty array for undates when none recorded', async () => {
            await expect(
                withinTransaction((session) =>
                    getProductUndates({ group: 'Daržovės', name: 'Morkos', year: 22 }, session)
                )
            ).resolves.toStrictEqual([]);
        });

        it('returns undate history entries after an undo', async () => {
            await withinTransaction((session) => undoProduct({ group: 'Daržovės', name: 'Morkos', year: 22 }, session));

            const result = await withinTransaction((session) =>
                getProductUndates({ group: 'Daržovės', name: 'Morkos', year: 22 }, session)
            );

            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Daržovės' && e.name === 'Morkos' && e.year === 22)).toBe(true);
        });
    });
});
