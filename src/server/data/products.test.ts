/** @vitest-environment node */
import { bulk } from '@tests/bulk';
import { getProductsFixture } from '@tests/fixtures';

import { addVariantAmount } from '@rusys/common/utils/amounts';

import { classifyImage, deleteImages, saveImage } from '~/server/data/images';
import {
    addProduct,
    cleanupRecycled,
    deleteProduct,
    deleteProductsGroup,
    deleteProductsVariant,
    getProducts,
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
import { db } from '~/server/db';
import { DEV_MODE_EMAIL } from '~/store/profile/dev';

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
        it('returns expiry tolerance days', async () => {
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Agurkai' }, { $set: { expiryToleranceDays: 365 } });

            await expect(getProducts([22])).resolves.toContainEqual(
                expect.objectContaining({ group: 'Daržovės', name: 'Agurkai', expiryToleranceDays: 365 })
            );
        });

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

        it('includes the image field when set', async () => {
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Agurkai' }, { $set: { image: '/images/ab/cd/agurkai.png' } });

            const agurkai = (await getProducts([22])).find((p) => p.name === 'Agurkai');

            expect(agurkai?.image).toBe('/images/ab/cd/agurkai.png');
        });

        it('leaves a genuinely icon-sized legacy image untouched, without writing anything back', async () => {
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Agurkai' }, { $set: { image: '/images/ab/cd/agurkai.png' } });

            await getProducts([22]);

            expect(classifyImage).toHaveBeenCalledWith('/images/ab/cd/agurkai.png');

            const stored = await (await db()).collection('products').findOne({ group: 'Daržovės', name: 'Agurkai' });

            expect(stored?.image).toBe('/images/ab/cd/agurkai.png');
            expect(stored?.photo).toBeUndefined();
        });

        it('backfills `photo` for a legacy image that turns out to be a photo, persisting the result', async () => {
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/agurkai.png',
            });
            await (
                await db()
            )
                .collection('products')
                .updateOne({ group: 'Daržovės', name: 'Agurkai' }, { $set: { image: '/images/ab/cd/agurkai.png' } });

            const agurkai = (await getProducts([22])).find((p) => p.name === 'Agurkai');

            expect(agurkai?.image).toBe('/images/ab/cd/thumb.png');
            expect(agurkai?.photo).toBe('/images/ab/cd/agurkai.png');

            const stored = await (await db()).collection('products').findOne({ group: 'Daržovės', name: 'Agurkai' });

            expect(stored?.image).toBe('/images/ab/cd/thumb.png');
            expect(stored?.photo).toBe('/images/ab/cd/agurkai.png');
        });

        it('backfills `variantPhotos` for a legacy variant image that turns out to be a photo', async () => {
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/d.png',
            });
            await (
                await db()
            )
                .collection('products')
                .updateOne(
                    { group: 'Daržovės', name: 'Agurkai' },
                    { $set: { 'variantImages.d': '/images/ab/cd/d.png' } }
                );

            const agurkai = (await getProducts([22])).find((p) => p.name === 'Agurkai');

            expect(agurkai?.variantImages).toStrictEqual({ d: '/images/ab/cd/thumb.png' });
            expect(agurkai?.variantPhotos).toStrictEqual({ d: '/images/ab/cd/d.png' });
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

        it('adds a product with a parent that exists in the same group', async () => {
            await expect(addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai')).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual([
                ...products,
                { group: 'Daržovės', name: 'Agurkai (Zewa)', parent: 'Agurkai' },
            ]);
        });

        it('does not add a product whose parent does not exist in the same group', async () => {
            await expect(addProduct('Daržovės', 'Agurkai (Zewa)', 'Neegzistuoja')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not add a product whose parent exists but in a different group', async () => {
            await expect(addProduct('Uogienės', 'Braškės (Zewa)', 'Agurkai')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not add a product that is its own parent', async () => {
            await expect(addProduct('Daržovės', 'Agurkai', 'Agurkai')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setProductParent', () => {
        type ProductRow = { group: string; name: string; parent?: string };

        beforeEach(async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');
        });

        it('sets the parent for a root-level product', async () => {
            await expect(setProductParent('Daržovės', 'Kopūstai', 'Agurkai')).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Kopūstai')?.parent).toBe('Agurkai');
        });

        it('clears the parent when no parent is given', async () => {
            await expect(setProductParent('Daržovės', 'Agurkai (Zewa)', undefined)).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai (Zewa)')?.parent).toBeUndefined();
        });

        it('rejects setting a product as its own parent', async () => {
            await expect(setProductParent('Daržovės', 'Agurkai', 'Agurkai')).resolves.toBe(false);
        });

        it('rejects setting a direct child as the parent (would create a cycle)', async () => {
            await expect(setProductParent('Daržovės', 'Agurkai', 'Agurkai (Zewa)')).resolves.toBe(false);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')?.parent).toBeUndefined();
        });

        it('rejects setting a grandchild as the parent (cycle at any depth)', async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa) 3sl.', 'Agurkai (Zewa)');

            await expect(setProductParent('Daržovės', 'Agurkai', 'Agurkai (Zewa) 3sl.')).resolves.toBe(false);
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

            await expect(setProductParent('Daržovės', 'CiklinisA', 'Kopūstai')).resolves.toBe(true);

            const all = (await $all('products')) as ProductRow[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'CiklinisA')?.parent).toBe('Kopūstai');
        });

        it('rejects a parent from a different group', async () => {
            await expect(setProductParent('Uogienės', 'Braškės', 'Agurkai')).resolves.toBe(false);
        });

        it('rejects a nonexistent parent', async () => {
            await expect(setProductParent('Daržovės', 'Kopūstai', 'Neegzistuoja')).resolves.toBe(false);
        });

        it.each`
            title            | group         | name
            ${'empty group'} | ${''}         | ${'Agurkai'}
            ${'empty name'}  | ${'Daržovės'} | ${''}
        `('returns false for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(setProductParent(group, name, 'Agurkai')).resolves.toBe(false);
        });
    });

    describe('updateProduct', () => {
        const amounts = [
            { variant: 'p', amount: 1, recycled: false },
            { variant: 'm', amount: 2 },
            { variant: 'd', amount: -1, recycled: true },
        ];

        it('updates products for existing group, name, and year', async () => {
            await expect(setAmounts('Daržovės', 'Agurkai', 22, amounts, user)).resolves.toBe(true);
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
                setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'x', amount: 1, recycled: false }], user)
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
            await expect(setAmounts('Daržovės', 'Agurkai', 0, amounts, user)).resolves.toBe(true);
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

        it('stores the given comment on the new update entry', async () => {
            await expect(setAmounts('Daržovės', 'Agurkai', 22, amounts, user, 'Pirktas kitas kiekis')).resolves.toBe(
                true
            );

            const all = (await $all('products')) as { group: string; name: string; updates?: { comment?: string }[] }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;

            expect(agurkai.updates?.at(-1)?.comment).toBe('Pirktas kitas kiekis');
        });

        it('unsets years entirely when a non-annual (year 0) update brings combined stock to zero', async () => {
            await expect(setAmounts('Daržovės', 'Agurkai', 0, [{ variant: 'd', amount: -3 }], user)).resolves.toBe(
                true
            );

            const all = (await $all('products')) as { group: string; name: string; years?: unknown }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;

            expect(agurkai.years).toBeUndefined();
        });

        it('does not update products if no updates made', async () => {
            const bruknes = { group: 'Uogienės', name: 'Bruknės', years: [{ year: 21, amounts: [] }] };
            await (await db()).collection('products').insertOne(bruknes, { forceServerObjectId: true });

            await expect(setAmounts('Uogienės', 'Bruknės', 21, [{ variant: 'p', amount: 0 }])).resolves.toBe(false);
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
                await expect(setAmounts(group, name, year, changes)).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );

        it('removes missing flag when missing and negative update received', async () => {
            await setAmounts('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: -1, recycled: false }], user);

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
            await setAmounts('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: 1, recycled: false }], user);

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
            await setAmounts('Uogienės', 'Braškės', 22, [amount], user);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: { '1.updates': { time, user, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('removes missing flag when missing and recycled update received and no amount left', async () => {
            await setAmounts('Uogienės', 'Braškės', 22, [{ variant: 'p', amount: -2, recycled: false }], user);

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

    describe('transferAmounts', () => {
        it('moves amounts between products in the same category', async () => {
            await expect(
                transferAmounts('Daržovės', 'Agurkai', 22, 'Daržovės', 'Kopūstai', [{ variant: 'd', amount: 2 }], user)
            ).resolves.toBe(true);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number }[] }[];
            }[];

            expect(
                all.find((product) => product.group === 'Daržovės' && product.name === 'Agurkai')?.years
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
                transferAmounts(
                    'Daržovės',
                    'Agurkai',
                    22,
                    'Daržovės',
                    'Kopūstai',
                    [
                        { variant: 'd', amount: 2 },
                        { variant: 'd', amount: 2 },
                    ],
                    user
                )
            ).resolves.toBe(false);
        });

        it('copies selected variants before moving them to another category', async () => {
            await expect(
                transferAmounts('Daržovės', 'Agurkai', 22, 'Uogienės', 'Avietės', [{ variant: 'd', amount: 2 }], user)
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
            await expect(moveConsumedToRecycled('Daržovės', 'Neegzistuoja', 22, 'd', 2, {}, undefined)).resolves.toBe(
                false
            );
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('appends a new entry with a positive consumed line and a matching negative recycled line, leaving old history and current balance untouched', async () => {
            await expect(moveConsumedToRecycled('Daržovės', 'Agurkai', 22, 'd', 2, {}, user)).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $push: {
                        '2.updates': {
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
                    },
                })
            );
        });

        it('carries suspicious/home/expiresAt flags through onto both lines', async () => {
            await expect(
                moveConsumedToRecycled(
                    'Daržovės',
                    'Agurkai',
                    22,
                    'd',
                    1,
                    { suspicious: true, home: true, expiresAt: 100 },
                    undefined
                )
            ).resolves.toBe(true);

            const all = (await $all('products')) as { updates: { years: { amounts: unknown[] }[] }[] }[];

            expect(all[2].updates.at(-1)?.years[0].amounts).toStrictEqual([
                { variant: 'd', amount: 1, recycled: false, suspicious: true, home: true, expiresAt: 100 },
                { variant: 'd', amount: -1, recycled: true, suspicious: true, home: true, expiresAt: 100 },
            ]);
        });

        it('clears undates so a stale redo cannot be applied afterwards', async () => {
            await undoProduct('Daržovės', 'Agurkai', 22);

            await expect(moveConsumedToRecycled('Daržovės', 'Agurkai', 22, 'd', 1, {}, undefined)).resolves.toBe(true);

            const all = (await $all('products')) as { undates?: unknown[] }[];

            expect(all[2].undates).toBeUndefined();
        });

        it.each`
            title                | group         | name         | variant | amount
            ${'empty group'}     | ${''}         | ${'Agurkai'} | ${'d'}  | ${1}
            ${'empty name'}      | ${'Daržovės'} | ${''}        | ${'d'}  | ${1}
            ${'empty variant'}   | ${'Daržovės'} | ${'Agurkai'} | ${''}   | ${1}
            ${'zero amount'}     | ${'Daržovės'} | ${'Agurkai'} | ${'d'}  | ${0}
            ${'negative amount'} | ${'Daržovės'} | ${'Agurkai'} | ${'d'}  | ${-1}
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
                await expect(moveConsumedToRecycled(group, name, 22, variant, amount, {}, undefined)).resolves.toBe(
                    false
                );
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -1, recycled: false }], user);
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -3, recycled: false }], user);

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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const agurkai = all[2];

            expect(agurkai.undates).toHaveLength(1);
            expect(agurkai.updates).toHaveLength(2);
        });

        it('stacks multiple undos correctly', async () => {
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);
            await undoProduct('Daržovės', 'Agurkai', 22);

            const all = (await $all('products')) as { updates?: unknown[]; undates?: unknown[] }[];
            const agurkai = all[2];

            expect(agurkai.undates).toHaveLength(2);
            expect(agurkai.updates).toHaveLength(2);
        });

        it('clears year entry when undo brings inventory to zero', async () => {
            await setAmounts('Daržovės', 'Kopūstai', 21, [{ variant: 'p', amount: 2, recycled: false }], user);
            await setAmounts('Daržovės', 'Kopūstai', 21, [{ variant: 'p', amount: -4, recycled: false }], user);
            await undoProduct('Daržovės', 'Kopūstai', 21);

            const all = (await $all('products')) as { years?: { year: number }[]; updates?: unknown[] }[];
            const kopustai = all[3];

            expect(kopustai.years?.find((y) => y.year === 21)).toBeDefined();
        });

        it('undoes a recycled update', async () => {
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -3, recycled: true }], user);
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2 }], user);
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

        it('pulls just that year out of years when undo zeroes out an annual product that also has other years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Agurkai' },
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

            await expect(undoProduct('Daržovės', 'Agurkai', 22)).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 21, amounts: [{ variant: 'd', amount: 9 }] }]);
        });

        describe('non-annual item (year 0, combined amounts)', () => {
            it('replaces the whole combined years entry when stock remains after undo', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Agurkai' },
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

                await expect(undoProduct('Daržovės', 'Agurkai', 0)).resolves.toBe(true);

                const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

                expect(all[2].years).toStrictEqual([{ year: 0, amounts: [{ variant: 'd', amount: 7 }] }]);
            });

            it('unsets years entirely when undo brings combined stock to zero', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Agurkai' },
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

                await expect(undoProduct('Daržovės', 'Agurkai', 0)).resolves.toBe(true);

                const all = (await $all('products')) as { years?: unknown }[];

                expect(all[2].years).toBeUndefined();
            });
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 2, recycled: false }], user);
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
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
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);
            await undoProduct('Daržovės', 'Agurkai', 22);
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 1, recycled: false }], user);

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

        it('pulls just that year out of years when redo zeroes out an annual product that also has other years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Agurkai' },
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

            await expect(redoProduct('Daržovės', 'Agurkai', 22)).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 21, amounts: [{ variant: 'd', amount: 9 }] }]);
        });

        it('pushes a new year entry when redo applies to a year currently missing from years', async () => {
            await (await db()).collection('products').updateOne(
                { group: 'Daržovės', name: 'Agurkai' },
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

            await expect(redoProduct('Daržovės', 'Agurkai', 22)).resolves.toBe(true);

            const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

            expect(all[2].years).toStrictEqual([{ year: 22, amounts: [{ variant: 'd', amount: 3 }] }]);
        });

        describe('non-annual item (year 0, combined amounts)', () => {
            it('replaces the whole combined years entry when stock remains after redo', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Agurkai' },
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

                await expect(redoProduct('Daržovės', 'Agurkai', 0)).resolves.toBe(true);

                const all = (await $all('products')) as { years?: { year: number; amounts: unknown[] }[] }[];

                expect(all[2].years).toStrictEqual([{ year: 0, amounts: [{ variant: 'd', amount: 3 }] }]);
            });

            it('unsets years entirely when redo brings combined stock to zero', async () => {
                await (await db()).collection('products').updateOne(
                    { group: 'Daržovės', name: 'Agurkai' },
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

                await expect(redoProduct('Daržovės', 'Agurkai', 0)).resolves.toBe(true);

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

        it("cascades the rename to children's parent field", async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

            await expect(renameProduct('Daržovės', 'Agurkai', 'Agurkėliai')).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai (Zewa)')?.parent).toBe('Agurkėliai');
        });

        it("does not affect other groups' or products' parent fields", async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

            await expect(renameProduct('Uogienės', 'Avietės', 'Agrastai')).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];

            expect(all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai (Zewa)')?.parent).toBe('Agurkai');
        });
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
            await setAmounts('Daržovės', 'Kopūstai', 22, [{ variant: 'p', amount: 1, recycled: false }], user);

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
            await setAmounts('Daržovės', 'Kopūstai', 21, [{ variant: 'd', amount: 1, recycled: false }], user);

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

        it('clears the parent field when moving to a different group', async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

            await expect(moveProduct('Daržovės', 'Agurkai (Zewa)', 'Šaldyti')).resolves.toBe(true);

            const all = (await $all('products')) as { group: string; name: string; parent?: string }[];
            const moved = all.find((p) => p.group === 'Šaldyti' && p.name === 'Agurkai (Zewa)');

            expect(moved?.parent).toBeUndefined();
        });
    });

    describe('deleteProduct', () => {
        afterEach(() => vi.clearAllMocks());

        it('archives products without removing their history', async () => {
            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(true);
            expect((await $all('products')).find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')).toMatchObject({
                archivedAt: expect.any(Number),
                years: products[2]?.years,
                updates: products[2]?.updates,
            });
        });

        it('archives products from a different group', async () => {
            await expect(deleteProduct('Uogienės', 'Avietės')).resolves.toBe(true);
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
            ${'empty group'}   | ${''}         | ${'Agurkai'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does not delete products for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(deleteProduct(group, name)).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('keeps the image file for an archived product', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not touch image files when the product has no image', async () => {
            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('keeps all variant image files for an archived product', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/d.png');
            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/p.png');
            await setVariantImage('Daržovės', 'Agurkai', 'p', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(true);

            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('does not delete a product that has children', async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');
            vi.clearAllMocks();

            await expect(deleteProduct('Daržovės', 'Agurkai')).resolves.toBe(false);

            expect(deleteImages).not.toHaveBeenCalled();

            const all = (await $all('products')) as { group: string; name: string }[];

            expect(all.some((p) => p.group === 'Daržovės' && p.name === 'Agurkai')).toBe(true);
        });

        it('archives a childless product even when other unrelated products have children', async () => {
            await addProduct('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

            await expect(deleteProduct('Daržovės', 'Kopūstai')).resolves.toBe(true);

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

            await expect(setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA')).resolves.toBe(true);

            expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
            expect(classifyImage).toHaveBeenCalledWith('/images/ab/cd/new-image.png');
            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '2.image': '/images/ab/cd/new-image.png' } })
            );
        });

        it('classifies a photo-sized upload, storing both the thumbnail and the photo', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/saved.png');
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/saved.png',
            });

            await expect(setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA')).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: { '2.image': '/images/ab/cd/thumb.png', '2.photo': '/images/ab/cd/saved.png' },
                })
            );
        });

        it('deletes the previous image file(s) when replacing it', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA');
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA');

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
        });

        it('deletes the image file when the image is removed', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await setImage('Daržovės', 'Agurkai', '');

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does not touch image files when the image is unchanged', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
            await setImage('Daržovės', 'Agurkai', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await setImage('Daržovės', 'Agurkai', '/images/same/same.png');

            expect(saveImage).not.toHaveBeenCalled();
            expect(deleteImages).not.toHaveBeenCalled();
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Agurkai'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'}
            ${'empty group'}   | ${''}         | ${'Agurkai'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does nothing for $title', async ({ group, name }: { group: string; name: string }) => {
            await expect(setImage(group, name, 'data:image/png;base64,AAA')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });
    });

    describe('setVariantImage', () => {
        afterEach(() => vi.clearAllMocks());

        it('uploads a new image, classifies it, and stores it under the variant key', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await expect(setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA')).resolves.toBe(true);

            expect(saveImage).toHaveBeenCalledWith('data:image/png;base64,AAA');
            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '2.variantImages.d': '/images/ab/cd/new-image.png' } })
            );
        });

        it('classifies a photo-sized variant upload, storing both the thumbnail and the photo', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/saved.png');
            vi.mocked(classifyImage).mockResolvedValueOnce({
                image: '/images/ab/cd/thumb.png',
                photo: '/images/ab/cd/saved.png',
            });

            await expect(setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA')).resolves.toBe(true);

            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.variantImages.d': '/images/ab/cd/thumb.png',
                        '2.variantPhotos.d': '/images/ab/cd/saved.png',
                    },
                })
            );
        });

        it('deletes the previous image file(s) when replacing it', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/new-image.png');

            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
        });

        it('deletes the image file when the image is removed', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/old.png');
            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await setVariantImage('Daržovės', 'Agurkai', 'd', '');

            expect(deleteImages).toHaveBeenCalledWith('/images/old/old.png', undefined);
            await expect($all('products')).resolves.toStrictEqual(bulk(products, { $set: { '2.variantImages': {} } }));
        });

        it('does not touch image files when the image is unchanged', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/same/same.png');
            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');
            vi.clearAllMocks();

            await setVariantImage('Daržovės', 'Agurkai', 'd', '/images/same/same.png');

            expect(saveImage).not.toHaveBeenCalled();
            expect(deleteImages).not.toHaveBeenCalled();
        });

        it('keeps images for different variants of the same product independent', async () => {
            vi.mocked(saveImage).mockResolvedValueOnce('/images/old/d.png');
            await setVariantImage('Daržovės', 'Agurkai', 'd', 'data:image/png;base64,AAA');
            vi.clearAllMocks();
            vi.mocked(saveImage).mockResolvedValueOnce('/images/ab/cd/p.png');

            await setVariantImage('Daržovės', 'Agurkai', 'p', 'data:image/png;base64,AAA');

            expect(deleteImages).toHaveBeenCalledWith(undefined, undefined);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, {
                    $set: {
                        '2.variantImages.d': '/images/old/d.png',
                        '2.variantImages.p': '/images/ab/cd/p.png',
                    },
                })
            );
        });

        it.each`
            title              | group         | name         | variant
            ${'invalid group'} | ${'Šaldyti'}  | ${'Agurkai'} | ${'d'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'} | ${'d'}
            ${'empty group'}   | ${''}         | ${'Agurkai'} | ${'d'}
            ${'empty name'}    | ${'Daržovės'} | ${''}        | ${'d'}
            ${'empty variant'} | ${'Daržovės'} | ${'Agurkai'} | ${''}
        `(
            'does nothing for $title',
            async ({ group, name, variant }: { group: string; name: string; variant: string }) => {
                await expect(setVariantImage(group, name, variant, 'data:image/png;base64,AAA')).resolves.toBe(false);
                await expect($all('products')).resolves.toStrictEqual(products);
            }
        );
    });

    describe('deleteProductVariant', () => {
        it('does not remove embedded variant history', async () => {
            await expect(deleteProductsVariant('Daržovės', 'p')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
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
        it('does not remove products when a category is archived', async () => {
            await expect(deleteProductsGroup('Daržovės')).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
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

    describe('setMissingBulk', () => {
        it('sets and unsets missing for multiple products in one call', async () => {
            await expect(
                setMissingBulk([
                    { group: 'Uogienės', name: 'Avietės', missing: true },
                    { group: 'Uogienės', name: 'Braškės', missing: false },
                ])
            ).resolves.toBe(true);
            await expect($all('products')).resolves.toStrictEqual(
                bulk(products, { $set: { '0.missing': true } }, { $unset: '1.missing' })
            );
        });

        it('does nothing for an empty list', async () => {
            await expect(setMissingBulk([])).resolves.toBe(false);
            await expect($all('products')).resolves.toStrictEqual(products);
        });

        it('does nothing when nothing actually changes', async () => {
            await expect(
                setMissingBulk([
                    { group: 'Uogienės', name: 'Avietės', missing: false },
                    { group: 'Uogienės', name: 'Braškės', missing: true },
                ])
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
            await setAmounts(
                'Daržovės',
                'Agurkai',
                22,
                [{ variant: 'd', amount: -1, recycled: false, suspicious: true }],
                user
            );

            const all = (await $all('products')) as {
                updates?: {
                    years: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
                }[];
            }[];
            const agurkai = all[2];
            const lastUpdate = agurkai.updates![agurkai.updates!.length - 1];
            const historyAmount = lastUpdate.years[0].amounts[0];

            expect(historyAmount.suspicious).toBe(true);
        });

        it('stores suspicious flag in years.amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Agurkai' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Agurkai' }, { forceServerObjectId: true });

            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 3, suspicious: true }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
            }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const yearEntry = agurkai.years?.find((y) => y.year === 22);

            expect(yearEntry?.amounts.find((a) => a.variant === 'd' && a.suspicious)).toBeDefined();
        });

        it('does NOT merge suspicious and non-suspicious amounts for same variant', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Agurkai' });
            await (await db()).collection('products').insertOne(
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                },
                { forceServerObjectId: true }
            );

            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 3, suspicious: true }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; suspicious?: boolean }[] }[];
            }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const amounts = agurkai.years?.find((y) => y.year === 22)?.amounts ?? [];

            // non-suspicious and suspicious are separate entries
            expect(amounts.filter((a) => a.variant === 'd')).toHaveLength(2);
            expect(amounts.find((a) => a.variant === 'd' && !a.suspicious)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'd' && a.suspicious)?.amount).toBe(3);
        });
    });

    describe('updateProduct with home amounts', () => {
        it('stores home flag in history amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Agurkai' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Agurkai' }, { forceServerObjectId: true });

            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 5, home: true }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                updates?: {
                    years: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
                }[];
            }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const lastUpdate = agurkai.updates![agurkai.updates!.length - 1];
            const historyAmount = lastUpdate.years[0].amounts[0];

            expect(historyAmount.home).toBe(true);
        });

        it('stores home flag in years.amounts', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Agurkai' });
            await (
                await db()
            )
                .collection('products')
                .insertOne({ group: 'Daržovės', name: 'Agurkai' }, { forceServerObjectId: true });

            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 5, home: true }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
            }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const yearEntry = agurkai.years?.find((y) => y.year === 22);

            expect(yearEntry?.amounts.find((a) => a.variant === 'd' && a.home)).toBeDefined();
        });

        it('does NOT merge home and non-home amounts for same variant', async () => {
            await (await db()).collection('products').deleteMany({ group: 'Daržovės', name: 'Agurkai' });
            await (await db()).collection('products').insertOne(
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                },
                { forceServerObjectId: true }
            );

            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: 3, home: true }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                years?: { year: number; amounts: { variant: string; amount: number; home?: boolean }[] }[];
            }[];
            const agurkai = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const amounts = agurkai.years?.find((y) => y.year === 22)?.amounts ?? [];

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
            await setAmounts('Šaldyti', 'Mėsa', 22, [{ variant: 'p', amount: -1, recycled: false }], user);

            const result = await getProducts([22]);
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            // cellar: 3 - 1 = 2, home: 5 - 5 (auto-consumed) = 0 → removed
            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'p' && a.home)).toBeUndefined();
        });

        it('auto-consume is saved in update history', async () => {
            await setAmounts('Šaldyti', 'Mėsa', 22, [{ variant: 'p', amount: -1, recycled: false }], user);

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
            await setAmounts('Šaldyti', 'Mėsa', 22, [{ variant: 'p', amount: -1, recycled: false, home: true }], user);

            const result = await getProducts([22]);
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            // home manually consumed by 1, cellar unchanged
            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(3);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(4);
        });

        it('does NOT auto-consume for recycled:true (thrown away)', async () => {
            await setAmounts('Šaldyti', 'Mėsa', 22, [{ variant: 'p', amount: -1, recycled: true }], user);

            const result = await getProducts([22]);
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(2);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(5);
        });

        it('does NOT auto-consume when variant has no home amounts', async () => {
            await setAmounts('Daržovės', 'Agurkai', 22, [{ variant: 'd', amount: -1, recycled: false }], user);

            const all = (await $all('products')) as {
                group: string;
                name: string;
                updates?: { years: { year: number; amounts: { variant: string; home?: boolean }[] }[] }[];
            }[];
            const product = all.find((p) => p.group === 'Daržovės' && p.name === 'Agurkai')!;
            const lastUpdate = product.updates![product.updates!.length - 1];
            const amounts = lastUpdate.years.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.filter((a) => a.home)).toHaveLength(0);
        });

        it('undo restores both cellar and auto-consumed home amounts', async () => {
            await setAmounts('Šaldyti', 'Mėsa', 22, [{ variant: 'p', amount: -1, recycled: false }], user);
            await undoProduct('Šaldyti', 'Mėsa', 22);

            const result = await getProducts([22]);
            const product = result.find((p) => p.group === 'Šaldyti' && p.name === 'Mėsa')!;
            const amounts = product.years?.find((y) => y.year === 22)?.amounts ?? [];

            expect(amounts.find((a) => a.variant === 'p' && !a.home)?.amount).toBe(3);
            expect(amounts.find((a) => a.variant === 'p' && a.home)?.amount).toBe(5);
        });
    });

    describe('getProductUpdates and getProductUndates', () => {
        it('returns update history entries for the given product and year', async () => {
            const result = await getProductUpdates('Daržovės', 'Agurkai', 22);

            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Daržovės' && e.name === 'Agurkai' && e.year === 22)).toBe(true);
        });

        it('returns empty array when product has no updates for that year', async () => {
            await expect(getProductUpdates('Daržovės', 'Kopūstai', 22)).resolves.toStrictEqual([]);
        });

        it('returns empty array for undates when none recorded', async () => {
            await expect(getProductUndates('Daržovės', 'Agurkai', 22)).resolves.toStrictEqual([]);
        });

        it('returns undate history entries after an undo', async () => {
            await undoProduct('Daržovės', 'Agurkai', 22);

            const result = await getProductUndates('Daržovės', 'Agurkai', 22);

            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Daržovės' && e.name === 'Agurkai' && e.year === 22)).toBe(true);
        });
    });
});
