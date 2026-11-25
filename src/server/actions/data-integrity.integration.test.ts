import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createScenarioData, currentYear } from '@tests/fixtures/data';

import JSZip from 'jszip';
import type { Db } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { SchemaError, type Product, type Variant } from '~/schema';
import { exportArchive, importArchive } from '~/server/actions/archive';
import { renameGroupAction, updateGroupAction } from '~/server/actions/groups';
import {
    getProductHistory,
    getProductsAction,
    moveConsumedToRecycledAction,
    redoProductAction,
    setAmountsAction,
    setAmountsBatchAction,
    setProductRemovingAction,
    transferAmountsAction,
    undoProductAction,
} from '~/server/actions/products';
import { getSummaryHistory, readProductConsumptionYears, readProductSummary } from '~/server/actions/summary';
import {
    copyVariantAction,
    deleteVariantAction,
    getVariantsAction,
    renameVariantAction,
    reorderVariantsAction,
    updateVariantAction,
} from '~/server/actions/variants';
import { importEverything } from '~/server/data/import';
import { $clients, $dbs, db } from '~/server/db';

vi.mock(import('~/server/auth/session'), () => ({
    requireSession: async () => ({ email: 'integration@example.test' }),
}));

const { imageDirectory } = vi.hoisted(() => ({ imageDirectory: { path: '' } }));
vi.mock(import('~/server/data/images'), async (original) => ({
    ...(await original()),
    get IMAGES_DIR() {
        return imageDirectory.path;
    },
}));

const source = { group: 'Uogienės', name: 'Avietės' };
const stock = { ...source, year: currentYear };
const jar = 'Stiklainis';
const largeJar = 'Didelis indelis';
const dbName = 'rusys_vitest_integrity';

describe('catalog integrity with MongoDB', () => {
    let mongo: MongoMemoryReplSet | undefined;
    let uri: string | undefined;
    let database: Db;

    beforeAll(async () => {
        mongo = await MongoMemoryReplSet.create({
            binary: { version: '8.2.6' },
            replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' },
        });
        uri = mongo.getUri();
        vi.stubEnv('DB', uri);
        vi.stubEnv('DB_NAME', dbName);
        database = await db();
        imageDirectory.path = await mkdtemp(path.join(tmpdir(), 'rusys-import-test-'));
    }, 120_000);

    beforeEach(async () => {
        const { groups, variants, products } = createScenarioData('annual');
        await Promise.all([
            database
                .collection('groups')
                .deleteMany({})
                .then(() => database.collection('groups').insertMany(groups)),
            database
                .collection('variants')
                .deleteMany({})
                .then(() => database.collection('variants').insertMany(variants)),
            database
                .collection('products')
                .deleteMany({})
                .then(() => database.collection('products').insertMany(products)),
        ]);
    });

    afterAll(async () => {
        try {
            if (uri) {
                await $clients.get(uri)?.close();
                $clients.delete(uri);
                $dbs.delete(dbName);
            }
        } finally {
            vi.unstubAllEnvs();
            await mongo?.stop();
            if (imageDirectory.path) {
                await rm(imageDirectory.path, { recursive: true, force: true });
            }
        }
    });

    function productCollection() {
        return database.collection<Product>('products');
    }

    function variantCollection() {
        return database.collection<Variant>('variants');
    }

    function consumptionPeriod(time: number) {
        const date = new Date(time);
        return date.getUTCFullYear() - 2000 - (date.getUTCMonth() < 8 ? 1 : 0);
    }

    async function catalog() {
        return Promise.all(
            ['groups', 'variants', 'products'].map((name) =>
                database.collection(name).find().sort({ _id: 1 }).toArray()
            )
        );
    }

    it.each([
        { targetGroup: source.group, targetName: 'Braškės', original: [] },
        { targetGroup: 'Daržovės', targetName: 'Morkos', original: [{ variant: 'Kilogramas', amount: 1 }] },
    ])(
        'transfers stock to $targetGroup/$targetName and preserves variant metadata',
        async ({ targetGroup, targetName, original }) => {
            await transferAmountsAction({ ...stock, targetGroup, targetName, amounts: [{ variant: jar, amount: 3 }] });

            const from = await productCollection().findOne(source);
            const to = await productCollection().findOne({ group: targetGroup, name: targetName });

            expect(from?.years).toStrictEqual([{ year: currentYear - 1, amounts: [{ variant: jar, amount: 2 }] }]);

            const targetAmounts = to?.years
                ?.filter(({ year }) => year === currentYear)
                .flatMap(({ amounts }) => amounts);

            expect(targetAmounts).toStrictEqual(expect.arrayContaining([...original, { variant: jar, amount: 3 }]));
            expect(targetAmounts).toHaveLength(original.length + 1);
            await expect(variantCollection().findOne({ group: targetGroup, variant: jar })).resolves.toMatchObject({
                count: 1,
                units: 'vnt',
            });
            await expect(variantCollection().countDocuments({ group: source.group, variant: jar })).resolves.toBe(1);
        }
    );

    it.each([
        {
            title: 'one removal exceeds the balance',
            requested: [{ variant: jar, amount: -5, recycled: false }],
            applied: [{ variant: jar, amount: -3, recycled: false }],
        },
        {
            title: 'several removals share the available balance and a same-edit addition',
            requested: [
                { variant: jar, amount: -2, recycled: false },
                { variant: jar, amount: -5, recycled: true },
                { variant: jar, amount: 1 },
                { variant: jar, amount: -1 },
            ],
            applied: [
                { variant: jar, amount: -2, recycled: false },
                { variant: jar, amount: -2, recycled: true },
                { variant: jar, amount: 1 },
            ],
        },
    ])('records the actual stock changes when $title', async ({ requested, applied }) => {
        const products = productCollection();
        const original = await products.findOne(source);
        const remainingYears = original?.years?.filter(({ year }) => year !== stock.year);

        await setAmountsAction({ ...stock, amounts: requested });

        const saved = await products.findOne(source);

        expect(saved?.years).toStrictEqual(remainingYears);
        expect(saved?.updates).toHaveLength(1);
        expect(saved?.updates?.[0].years).toStrictEqual([{ year: stock.year, amounts: applied }]);

        await undoProductAction(stock);

        const undone = await products.findOne(source);

        expect(undone?.years).toStrictEqual(original?.years);
        expect(undone?.updates).toStrictEqual([]);
        expect(undone?.undates).toStrictEqual(saved?.updates);

        await redoProductAction(stock);

        await expect(products.findOne(source)).resolves.toStrictEqual(saved);
    });

    it.each([0, Date.UTC(2027, 0, 1)])('consumes duplicate rows for expiry %s as one batch', async (expiresAt) => {
        const products = productCollection();
        const otherBatch = { variant: jar, amount: 4, expiresAt: expiresAt + 1000 };
        await products.updateOne(source, {
            $set: {
                years: [
                    {
                        year: stock.year,
                        amounts: [
                            { variant: jar, amount: 1, expiresAt },
                            { variant: jar, amount: 2, expiresAt },
                            otherBatch,
                        ],
                    },
                ],
            },
        });

        await setAmountsAction({ ...stock, amounts: [{ variant: jar, amount: -5, expiresAt }] });

        const saved = await products.findOne(source);

        expect(saved?.years).toStrictEqual([{ year: stock.year, amounts: [otherBatch] }]);
        expect(saved?.updates?.[0].years).toStrictEqual([
            { year: stock.year, amounts: [{ variant: jar, amount: -3, expiresAt }] },
        ]);

        await undoProductAction(stock);

        const undone = await products.findOne(source);

        expect(undone?.years).toStrictEqual([
            { year: stock.year, amounts: [otherBatch, { variant: jar, amount: 3, expiresAt }] },
        ]);

        await redoProductAction(stock);

        await expect(products.findOne(source)).resolves.toStrictEqual(saved);
    });

    it('keeps the stock and history intact when there is nothing to remove from a batch', async () => {
        const before = await catalog();

        await expect(
            setAmountsAction({ ...stock, amounts: [{ variant: jar, amount: -5, home: true, recycled: false }] })
        ).rejects.toThrow(SchemaError.RequestFailed);
        await expect(catalog()).resolves.toStrictEqual(before);
    });

    it('rolls back a multi-year edit when a later change cannot remove any stock', async () => {
        const before = await catalog();

        await expect(
            setAmountsBatchAction([
                { ...stock, amounts: [{ variant: jar, amount: -5 }] },
                { ...stock, year: stock.year - 1, amounts: [{ variant: largeJar, amount: -5 }] },
            ])
        ).rejects.toThrow(SchemaError.RequestFailed);
        await expect(catalog()).resolves.toStrictEqual(before);
    });

    it('leaves stock and variants untouched when a transfer exceeds the balance', async () => {
        const before = await catalog();

        await expect(
            transferAmountsAction({
                ...stock,
                targetGroup: 'Daržovės',
                targetName: 'Morkos',
                amounts: [{ variant: jar, amount: 4 }],
            })
        ).rejects.toThrow(SchemaError.RequestFailed);
        await expect(catalog()).resolves.toStrictEqual(before);
    });

    it.each([
        {
            title: 'reduces stock without consumption',
            changes: [{ variant: jar, amount: -1 }],
            balance: 2,
            summary: [],
        },
        {
            title: 'adds stock and records discarded amounts',
            changes: [
                { variant: jar, amount: 2 },
                { variant: jar, amount: -1, recycled: true },
            ],
            balance: 4,
            summary: [{ variant: jar, amount: 1, recycled: true }],
        },
        {
            title: 'updates two variants in one action',
            changes: [
                { variant: jar, amount: -1, recycled: false },
                { variant: largeJar, amount: -2, recycled: true },
            ],
            balance: 2,
            summary: [
                { variant: jar, amount: 1, recycled: false },
                { variant: largeJar, amount: 2, recycled: true },
            ],
        },
    ])('$title', async ({ changes, balance, summary }) => {
        await productCollection().updateOne(source, { $push: { 'years.1.amounts': { variant: largeJar, amount: 4 } } });
        await setAmountsAction({ ...stock, amounts: changes });
        const saved = await productCollection().findOne(source);
        const update = saved?.updates?.[0];

        expect(saved?.years?.find(({ year }) => year === currentYear)?.amounts).toStrictEqual([
            { variant: jar, amount: balance },
            { variant: largeJar, amount: changes[1]?.variant === largeJar ? 2 : 4 },
        ]);
        expect(saved?.updates).toHaveLength(1);
        expect(update?.years[0]?.amounts).toStrictEqual(changes);
        await expect(readProductSummary({ ...source, year: consumptionPeriod(update!.time) })).resolves.toStrictEqual(
            summary
        );
    });

    it('reclassifies part of a consumed entry without changing the remaining stock', async () => {
        await setAmountsAction({ ...stock, amounts: [{ variant: jar, amount: -2, recycled: false }] });
        const { updates } = await getProductHistory(stock);
        const consumed = updates[0]!;

        expect(consumed.sessionId).toStrictEqual(expect.any(String));

        await moveConsumedToRecycledAction({ ...stock, variant: jar, amount: 1, sourceSessionId: consumed.sessionId! });
        const saved = await productCollection().findOne(source);
        const period = { ...source, year: consumptionPeriod(consumed.time) };

        expect(saved?.updates).toHaveLength(2);
        expect(saved?.years?.find(({ year }) => year === currentYear)?.amounts).toStrictEqual([
            { variant: jar, amount: 1 },
        ]);
        await expect(readProductSummary(period)).resolves.toStrictEqual(
            expect.arrayContaining([
                { variant: jar, amount: 1, recycled: false },
                { variant: jar, amount: 1, recycled: true },
            ])
        );

        const history = await getSummaryHistory(period);

        expect(history.updates.flatMap(({ amounts }) => amounts)).toStrictEqual(
            expect.arrayContaining([
                { variant: jar, amount: -1, recycled: false },
                { variant: jar, amount: -1, recycled: true },
            ])
        );
    });

    it('renames a category and its product and variant references', async () => {
        const targetGroup = 'Uogų uogienės';
        await renameGroupAction({ group: source.group, targetGroup });

        for (const [collection, count] of [
            ['groups', 1],
            ['products', 2],
            ['variants', 2],
        ] as const) {
            await expect(database.collection(collection).countDocuments({ group: source.group })).resolves.toBe(0);
            await expect(database.collection(collection).countDocuments({ group: targetGroup })).resolves.toBe(count);
        }
    });

    it('persists the selected category options when creating a category', async () => {
        const group = 'Uogų atsargos';
        await updateGroupAction({ group, annual: false, review: true });

        await expect(database.collection('groups').findOne({ group })).resolves.toMatchObject({
            annual: false,
            review: true,
        });
    });

    it('preserves variant display metadata through creation, rename, and reorder', async () => {
        const group = source.group;
        await updateVariantAction({ group, variant: 'Šeimyninis stiklainis', count: 4, suffix: 'pak.', units: 'vnt' });
        await renameVariantAction({ group, variant: 'Šeimyninis stiklainis', targetVariant: 'Dovanų rinkinys' });
        await reorderVariantsAction({ group, variants: { 'Dovanų rinkinys': 0, [jar]: 1, [largeJar]: 2 } });
        await deleteVariantAction({ group, variant: largeJar });

        const { variants } = await getVariantsAction();

        expect(variants.filter((variant) => variant.group === group).map((variant) => variant.variant)).toStrictEqual([
            'Dovanų rinkinys',
            jar,
        ]);
        expect(
            variants.find((variant) => variant.group === group && variant.variant === 'Dovanų rinkinys')
        ).toMatchObject({
            count: 4,
            suffix: 'pak.',
            units: 'vnt',
        });
        await expect(variantCollection().findOne({ group, variant: largeJar })).resolves.toMatchObject({
            archivedAt: expect.any(Number),
        });
    });

    it('renames a variant and rewrites stock rows that reference it', async () => {
        const targetVariant = 'Vienas stiklainis';
        await renameVariantAction({ group: source.group, variant: jar, targetVariant });
        const saved = await productCollection().findOne(source);

        expect(saved?.years?.map(({ amounts }) => amounts)).toStrictEqual([
            [{ variant: targetVariant, amount: 2 }],
            [{ variant: targetVariant, amount: 3 }],
        ]);
        await expect(variantCollection().countDocuments({ group: source.group, variant: jar })).resolves.toBe(0);
        await expect(
            variantCollection().findOne({ group: source.group, variant: targetVariant })
        ).resolves.toMatchObject({
            count: 1,
            units: 'vnt',
        });
    });

    it('copies a variant definition without modifying the source', async () => {
        const identity = { group: source.group, variant: largeJar };
        const before = await variantCollection().findOne(identity);
        await copyVariantAction({ ...identity, targetGroup: 'Daržovės' });

        await expect(variantCollection().findOne(identity)).resolves.toStrictEqual(before);
        await expect(variantCollection().findOne({ ...identity, group: 'Daržovės' })).resolves.toMatchObject({
            count: 1,
            units: 'vnt',
        });
    });

    it('persists a removal marker only for the selected stock year', async () => {
        await setProductRemovingAction({ ...stock, removing: true });
        const saved = await productCollection().findOne(source);

        expect(saved?.years).toStrictEqual([
            { year: currentYear - 1, amounts: [{ variant: jar, amount: 2 }] },
            { year: currentYear, amounts: [{ variant: jar, amount: 3 }], removing: true },
        ]);
    });

    it('splits consumption totals and history at midnight UTC on September 1', async () => {
        const boundaryYear = currentYear - 1;
        const periods = [
            {
                year: boundaryYear - 1,
                time: Date.UTC(2000 + boundaryYear, 7, 31, 23, 59, 59, 999),
                comment: 'Before the boundary',
                amount: 2,
            },
            { year: boundaryYear, time: Date.UTC(2000 + boundaryYear, 8, 1), comment: 'At the boundary', amount: 5 },
        ];
        await productCollection().updateOne(source, {
            $set: {
                updates: periods.map(({ time, comment, amount }) => ({
                    time,
                    comment,
                    years: [{ year: currentYear - 1, amounts: [{ variant: jar, amount: -amount, recycled: false }] }],
                })),
                years: [{ year: currentYear, amounts: [{ variant: jar, amount: 3 }] }],
            },
        });

        await expect(readProductConsumptionYears(source)).resolves.toStrictEqual([boundaryYear, boundaryYear - 1]);

        for (const { year, comment, amount } of periods) {
            const identity = { ...source, year };

            await expect(readProductSummary(identity)).resolves.toStrictEqual([
                { variant: jar, amount, recycled: false },
            ]);
            expect((await getSummaryHistory(identity)).updates.map((entry) => entry.comment)).toStrictEqual([comment]);
        }
    });

    function uploadArchive(bytes: Uint8Array) {
        const data = new FormData();
        data.set('import', new File([Uint8Array.from(bytes)], 'catalog.zip', { type: 'application/zip' }));
        return importArchive(data);
    }

    async function importCatalog(documents: unknown, images: Record<string, string> = {}) {
        const zip = new JSZip().file('data.json', JSON.stringify(documents));
        for (const [relativePath, content] of Object.entries(images)) {
            zip.file(`images/${relativePath}`, content);
        }
        return uploadArchive(await zip.generateAsync({ type: 'uint8array' }));
    }

    it('restores an export over existing data and preserves sessions, profiles, and catalog indexes', async () => {
        const indexes = await Promise.all(
            ['products', 'variants', 'groups'].map((name) => database.collection(name).indexes())
        );
        const profile = { email: 'archive-preserved@example.test' };
        const activeSession = { tokenHash: 'archive-preserved', expiresAt: new Date(Date.now() + 60_000) };
        await database.collection('user_profiles').insertOne(profile);
        await database.collection('sessions').insertOne(activeSession);
        try {
            await productCollection().updateOne(source, {
                $set: {
                    expiryToleranceDays: 14,
                    years: [{ year: currentYear, amounts: [{ variant: jar, amount: 2.5 }] }],
                },
            });
            const exported = Buffer.from(await exportArchive(), 'base64');
            await productCollection().insertOne({ group: source.group, name: 'Added after export' });

            await expect(uploadArchive(exported)).resolves.toBeUndefined();
            expect((await getProductsAction()).products).toContainEqual(
                expect.objectContaining({
                    ...source,
                    expiryToleranceDays: 14,
                    years: [{ year: currentYear, amounts: [{ variant: jar, amount: 2.5 }] }],
                })
            );
            await expect(productCollection().countDocuments({ name: 'Added after export' })).resolves.toBe(0);
            await expect(
                database.collection('sessions').findOne({ tokenHash: activeSession.tokenHash })
            ).resolves.toStrictEqual(expect.objectContaining(activeSession));
            await expect(database.collection('user_profiles').findOne({ email: profile.email })).resolves.toStrictEqual(
                expect.objectContaining(profile)
            );
            await expect(
                Promise.all(['products', 'variants', 'groups'].map((name) => database.collection(name).indexes()))
            ).resolves.toStrictEqual(indexes);
        } finally {
            await database.collection('sessions').deleteOne({ tokenHash: activeSession.tokenHash });
            await database.collection('user_profiles').deleteOne({ email: profile.email });
        }
    });

    it('can replace the catalog with empty collections', async () => {
        await expect(importCatalog({ products: [], variants: [], groups: [] })).resolves.toBeUndefined();

        await expect(catalog()).resolves.toStrictEqual([[], [], []]);
    });

    it('keeps concurrent imports separate even when starting from an empty catalog', async () => {
        await importEverything({ products: [], variants: [], groups: [] }, async () => {});
        const firstReady = Promise.withResolvers<void>();
        const releaseFirst = Promise.withResolvers<void>();
        const documents = (group: string) => ({
            products: [{ group, name: 'Product' }],
            variants: [{ group, variant: 'Variant', order: 0 }],
            groups: [{ group, order: 0 }],
        });
        const first = importEverything(documents('First'), async () => {
            firstReady.resolve();
            await releaseFirst.promise;
        });
        try {
            await Promise.race([firstReady.promise, first]);

            await expect(catalog()).resolves.toStrictEqual([[], [], []]);

            const second = importEverything(documents('Second'), async () => {});
            releaseFirst.resolve();
            await Promise.all([first, second]);

            await expect(catalog()).resolves.toStrictEqual([
                [expect.objectContaining({ group: 'Second', order: 0 })],
                [expect.objectContaining({ group: 'Second', variant: 'Variant', order: 0 })],
                [expect.objectContaining({ group: 'Second', name: 'Product' })],
            ]);
        } finally {
            releaseFirst.resolve();
            await first;
        }
    });

    it('reads an imported legacy product with null history years and stock amounts', async () => {
        const time = '2026-09-01T00:00:00Z';

        await expect(
            importCatalog({
                groups: [{ group: source.group, order: 0 }],
                variants: [],
                products: [
                    {
                        ...source,
                        years: [{ year: currentYear, amounts: null }],
                        updates: [{ time, years: null }],
                        undates: [{ time, years: null }],
                    },
                ],
            })
        ).resolves.toBeUndefined();

        expect((await getProductsAction()).products).toStrictEqual([
            expect.objectContaining({
                ...source,
                years: [{ year: currentYear, amounts: [] }],
                updates: [{ time: Date.parse(time), years: [] }],
                undates: [{ time: Date.parse(time), years: [] }],
            }),
        ]);
    });

    it('rolls back earlier collection writes when the last collection violates a unique index', async () => {
        const before = await catalog();
        const image = 'ab/cd/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
        const filesBefore = await readdir(imageDirectory.path, { recursive: true });

        await expect(
            importCatalog(
                {
                    products: [{ group: 'New', name: 'New product', image: `/images/${image}` }],
                    variants: [{ group: 'New', variant: 'New variant', order: 0 }],
                    groups: [
                        { group: 'New', order: 0 },
                        { group: 'New', order: 1 },
                    ],
                },
                { [image]: 'not published' }
            )
        ).resolves.toBe(SchemaError.ImportFailed);

        await expect(catalog()).resolves.toStrictEqual(before);
        await expect(readdir(imageDirectory.path, { recursive: true })).resolves.toStrictEqual(filesBefore);
    });

    it('restores images at new paths and rewrites every catalog reference to the same archived image', async () => {
        const image = 'ab/cd/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.png';
        const unreferenced = 'ab/cd/dddddddddddddddddddddddddddddddd.png';
        const archiveUrl = `/images/${image}`;
        const oldPath = path.join(imageDirectory.path, image);
        await mkdir(path.dirname(oldPath), { recursive: true });
        await writeFile(oldPath, 'existing image');
        const archived = {
            products: [
                {
                    ...source,
                    image: archiveUrl,
                    photo: archiveUrl,
                    variantImages: { [jar]: archiveUrl },
                    variantPhotos: { [jar]: archiveUrl },
                },
            ],
            groups: [{ group: source.group, order: 0, image: archiveUrl, photo: archiveUrl }],
            variants: [],
        };

        const filesBefore = (await readdir(imageDirectory.path, { recursive: true })).filter((file) =>
            file.endsWith('.png')
        );

        await expect(
            importCatalog(archived, { [image]: 'archive image', [unreferenced]: 'unused' })
        ).resolves.toBeUndefined();

        const restored = await productCollection().findOne(source);
        const url = restored?.image;

        expect(url).toMatch(/^\/images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.png$/);
        expect(url).not.toBe(archiveUrl);
        expect(restored).toMatchObject({ photo: url, variantImages: { [jar]: url }, variantPhotos: { [jar]: url } });
        await expect(database.collection('groups').findOne({ group: source.group })).resolves.toMatchObject({
            image: url,
            photo: url,
        });
        await expect(readFile(path.join(imageDirectory.path, url!.slice('/images/'.length)), 'utf8')).resolves.toBe(
            'archive image'
        );
        await expect(readFile(oldPath, 'utf8')).resolves.toBe('existing image');

        const filesAfter = (await readdir(imageDirectory.path, { recursive: true })).filter((file) =>
            file.endsWith('.png')
        );

        expect(filesAfter).toHaveLength(filesBefore.length + 1);
    });

    it('keeps the catalog intact when image storage cannot be written', async () => {
        const before = await catalog();
        const root = imageDirectory.path;
        imageDirectory.path = path.join(root, 'blocked');
        await writeFile(imageDirectory.path, 'blocks image writes');
        const image = 'ab/cd/cccccccccccccccccccccccccccccccc.png';
        try {
            await expect(
                importCatalog(
                    { products: [{ ...source, image: `/images/${image}` }], groups: [], variants: [] },
                    { [image]: 'archive image' }
                )
            ).resolves.toBe(SchemaError.ImportFailed);

            await expect(catalog()).resolves.toStrictEqual(before);
        } finally {
            imageDirectory.path = root;
        }
    });

    it.each(['broken ZIP', 'invalid schema'])('rejects a %s without replacing any catalog data', async (kind) => {
        const before = await catalog();
        const zip = new JSZip().file('data.json', '{}');
        const bytes =
            kind === 'broken ZIP'
                ? new TextEncoder().encode('not a zip')
                : await zip.generateAsync({ type: 'uint8array' });
        const data = new FormData();
        data.set('import', new File([Uint8Array.from(bytes)], 'invalid.zip', { type: 'application/zip' }));

        await expect(importArchive(data)).resolves.toBe(SchemaError.ImportFailed);
        await expect(catalog()).resolves.toStrictEqual(before);
    });
});
