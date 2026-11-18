import { createScenarioData, currentYear } from '@tests/fixtures/data';

import JSZip from 'jszip';
import type { Db } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { SchemaError, type Product, type Variant } from '~/schema';
import { importArchive } from '~/server/actions/archive';
import { renameGroupAction } from '~/server/actions/groups';
import {
    getProductHistory,
    moveConsumedToRecycledAction,
    setAmountsAction,
    setProductRemovingAction,
    transferAmountsAction,
} from '~/server/actions/products';
import { getSummaryHistory, readProductConsumptionYears, readProductSummary } from '~/server/actions/summary';
import { copyVariantAction, renameVariantAction } from '~/server/actions/variants';
import { $clients, $dbs, db } from '~/server/db';

vi.mock(import('~/server/auth/session'), () => ({
    requireSession: async () => ({ email: 'integration@example.test' }),
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
