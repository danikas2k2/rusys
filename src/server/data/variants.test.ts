import {
    getAggregatedVariantsFixture,
    getGroupsFixture,
    getProductsFixture,
    getVariantsFixture,
} from '@tests/fixtures';

import { MongoError } from 'mongodb';

import { SchemaError } from '~/schema/errors';
import { $all } from '~/server/data/tests/utils';
import {
    copyVariant as copyVariantData,
    copyVariants as copyVariantsData,
    deleteVariant as deleteVariantData,
    deleteVariantsGroup as deleteVariantsGroupData,
    getVariants as getVariantsData,
    renameVariant as renameVariantData,
    renameVariantsGroup as renameVariantsGroupData,
    reorderVariants as reorderVariantsData,
    updateVariant as updateVariantData,
} from '~/server/data/variants';
import { db, withinTransaction } from '~/server/db';

vi.setConfig({ testTimeout: 30_000 });

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/years'));

describe('variants', () => {
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    beforeEach(async () => {
        const options = { forceServerObjectId: true };
        const d = await db();
        await d.collection('products').insertMany(getProductsFixture(), options);
        await d.collection('variants').insertMany(variants, options);
        await d.collection('groups').insertMany(groups, options);
    });

    afterEach(async () => {
        const d = await db();
        await d.collection('products').deleteMany();
        await d.collection('variants').deleteMany();
        await d.collection('groups').deleteMany();
        vi.clearAllMocks();
    });

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            await expect(withinTransaction((session) => getVariantsData(session))).resolves.toStrictEqual(
                getAggregatedVariantsFixture()
            );
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order and suffix', async () => {
            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'p', order: 0, suffix: 'AA' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], order: 0, suffix: 'AA' },
                ...variants.slice(1),
            ]);
        });

        it('updates variant by changing order only', async () => {
            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'd', order: 0 }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { ...variants[1], order: 0 },
                ...variants.slice(2),
            ]);
        });

        it('updates variant by changing suffix only', async () => {
            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'd', order: 1, suffix: 'DD' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { group: 'Uogienės', variant: 'd', order: 1, suffix: 'DD' },
                ...variants.slice(2),
            ]);
        });

        it('updates variant by setting count and units', async () => {
            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'p', count: 500, units: 'ml' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], count: 500, units: 'ml' },
                ...variants.slice(1),
            ]);
        });

        it('preserves count and units when omitted from the update', async () => {
            await withinTransaction((session) =>
                updateVariantData({ group: 'Uogienės', variant: 'p', count: 500, units: 'ml' }, session)
            );

            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'p', order: 7 }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], order: 7, count: 500, units: 'ml' },
                ...variants.slice(1),
            ]);
        });

        it.each`
            title                | group         | variant | update
            ${'nothing changes'} | ${'Uogienės'} | ${'m'}  | ${{ order: 2, suffix: 'M.' }}
            ${'empty group'}     | ${''}         | ${'p'}  | ${{ order: 0, suffix: 'AA' }}
            ${'empty variant'}   | ${'Uogienės'} | ${''}   | ${{ order: 0, suffix: 'AA' }}
        `(
            'does not update variant when $title',
            async ({
                group,
                variant,
                update,
            }: {
                group: string;
                variant: string;
                update: { order?: number; suffix?: string };
            }) => {
                await expect(
                    withinTransaction((session) =>
                        updateVariantData({ group, variant, order: update.order, suffix: update.suffix }, session)
                    )
                ).resolves.toBe(false);
                await expect($all('variants')).resolves.toStrictEqual(variants);
            }
        );

        it.each`
            title                        | group         | variant | update                        | expected
            ${'same order'}              | ${'Uogienės'} | ${'z'}  | ${{ order: 3, suffix: 'M.' }} | ${{}}
            ${'incremented order'}       | ${'Uogienės'} | ${'z'}  | ${{ suffix: 'M.' }}           | ${{ order: 5 }}
            ${'new group'}               | ${'Šaldyti'}  | ${'m'}  | ${{ order: 3, suffix: 'M.' }} | ${{}}
            ${'new group without order'} | ${'Šaldyti'}  | ${'m'}  | ${{ suffix: 'M.' }}           | ${{ order: 0 }}
        `(
            'adds new variant with $title',
            async ({
                group,
                variant,
                update,
                expected,
            }: {
                group: string;
                variant: string;
                update: { order?: number; suffix?: string };
                expected: object;
            }) => {
                await expect(
                    withinTransaction((session) =>
                        updateVariantData({ group, variant, order: update.order, suffix: update.suffix }, session)
                    )
                ).resolves.toBe(true);
                await expect($all('variants')).resolves.toStrictEqual([
                    ...variants,
                    { group, variant, ...update, ...expected },
                ]);
            }
        );
    });

    describe('transactional variant metadata and identities', () => {
        it('preserves omitted metadata and explicitly clears the suffix on a partial update', async () => {
            await withinTransaction((session) =>
                updateVariantData(
                    { group: 'Uogienės', variant: 'p', order: 7, suffix: 'old', count: 5, units: 'kg' },
                    session
                )
            );

            await expect(
                withinTransaction((session) =>
                    updateVariantData({ group: 'Uogienės', variant: 'p', order: 0, suffix: '' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toContainEqual({
                group: 'Uogienės',
                variant: 'p',
                order: 0,
                count: 5,
                units: 'kg',
            });
        });

        it('restores the existing archived identity without losing metadata or inserting a duplicate', async () => {
            await (
                await db()
            )
                .collection('variants')
                .updateOne({ group: 'Uogienės', variant: 'd' }, { $set: { archivedAt: 1, count: 5, units: 'kg' } });

            await expect(
                withinTransaction((session) => updateVariantData({ group: 'Uogienės', variant: 'd' }, session))
            ).resolves.toBe(true);

            const records = await $all('variants');

            expect(records).toHaveLength(variants.length);
            expect(records).toContainEqual({ ...variants[1], count: 5, units: 'kg' });
        });

        it.each([{}, { archivedAt: 1 }])('rejects an occupied rename target with metadata %j', async (metadata) => {
            await (
                await db()
            )
                .collection('variants')
                .updateOne({ group: 'Daržovės', variant: 'd' }, { $set: metadata });
            const before = await $all('variants');

            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'p', targetVariant: 'd' }, session)
                )
            ).rejects.toThrow(SchemaError.VariantAlreadyExists);
            await expect($all('variants')).resolves.toStrictEqual(before);
        });

        it.each([{}, { archivedAt: 1 }])('rejects an occupied copy target with metadata %j', async (metadata) => {
            await (
                await db()
            )
                .collection('variants')
                .updateOne({ group: 'Daržovės', variant: 'd' }, { $set: metadata });
            const before = await $all('variants');

            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Daržovės', targetVariant: 'd' },
                        session
                    )
                )
            ).rejects.toThrow(SchemaError.VariantAlreadyExists);
            await expect($all('variants')).resolves.toStrictEqual(before);
        });

        it('reports a missing or archived rename source', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'missing', targetVariant: 'new' }, session)
                )
            ).rejects.toThrow(SchemaError.NotFound);

            await (
                await db()
            )
                .collection('variants')
                .updateOne({ group: 'Daržovės', variant: 'p' }, { $set: { archivedAt: 1 } });

            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'p', targetVariant: 'new' }, session)
                )
            ).rejects.toThrow(SchemaError.NotFound);
        });

        it('compares actual database identities rather than client name heuristics', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'p', targetVariant: 'D' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toContainEqual({ ...variants[6], variant: 'D' });
        });

        it('preserves all omitted metadata on rename', async () => {
            await withinTransaction((session) =>
                updateVariantData(
                    { group: 'Daržovės', variant: 'p', order: 0, suffix: 'old', count: 5, units: 'kg' },
                    session
                )
            );

            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'p', targetVariant: 'new' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toContainEqual({
                group: 'Daržovės',
                variant: 'new',
                order: 0,
                suffix: 'old',
                count: 5,
                units: 'kg',
            });
        });

        it.each(['update', 'rename', 'copy'] as const)(
            'maps a duplicate-key race during %s to a stable domain error',
            async (operation) => {
                const database = await db();
                const col = database.collection('variants');
                const collection = vi.spyOn(database, 'collection').mockReturnValue(col);
                vi.mocked(db).mockResolvedValueOnce(database);
                const write = operation === 'rename' ? vi.spyOn(col, 'updateOne') : vi.spyOn(col, 'insertOne');
                const cause = new MongoError('private database details');
                cause.code = 11000;
                write.mockRejectedValueOnce(cause);
                try {
                    const result =
                        operation === 'update'
                            ? withinTransaction((session) =>
                                  updateVariantData({ group: 'Uogienės', variant: 'new' }, session)
                              )
                            : operation === 'rename'
                              ? withinTransaction((session) =>
                                    renameVariantData(
                                        { group: 'Uogienės', variant: 'p', targetVariant: 'new' },
                                        session
                                    )
                                )
                              : withinTransaction((session) =>
                                    copyVariantData(
                                        { group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti' },
                                        session
                                    )
                                );

                    await expect(result).rejects.toThrow(SchemaError.VariantAlreadyExists);
                } finally {
                    collection.mockRestore();
                    write.mockRestore();
                }
            }
        );

        it.each(['update existing', 'insert', 'rename'] as const)(
            'uses one transaction for all reads and writes during %s',
            async (operation) => {
                const database = await db();
                const col = database.collection('variants');
                const collection = vi.spyOn(database, 'collection').mockReturnValue(col);
                vi.mocked(db).mockResolvedValueOnce(database);
                const read = vi.spyOn(col, 'findOne');
                const aggregate = vi.spyOn(col, 'aggregate');
                const update = vi.spyOn(col, 'updateOne');
                const insert = vi.spyOn(col, 'insertOne');
                try {
                    if (operation === 'rename') {
                        await withinTransaction((session) =>
                            renameVariantData({ group: 'Uogienės', variant: 'p', targetVariant: 'new' }, session)
                        );
                    } else {
                        await withinTransaction((session) =>
                            updateVariantData(
                                { group: 'Uogienės', variant: operation === 'insert' ? 'new' : 'p', order: 7 },
                                session
                            )
                        );
                    }

                    expect(withinTransaction).toHaveBeenCalledTimes(1);

                    const session = read.mock.calls[0]?.[1]?.session;

                    expect(session).toBeDefined();

                    for (const call of read.mock.calls) {
                        expect(call[1]?.session).toBe(session);
                    }
                    for (const call of aggregate.mock.calls) {
                        expect(call[1]?.session).toBe(session);
                    }
                    for (const call of update.mock.calls) {
                        expect(call[2]?.session).toBe(session);
                    }
                    for (const call of insert.mock.calls) {
                        expect(call[1]?.session).toBe(session);
                    }

                    expect(read).toHaveBeenCalledTimes(1);
                } finally {
                    collection.mockRestore();
                    read.mockRestore();
                    aggregate.mockRestore();
                    update.mockRestore();
                    insert.mockRestore();
                }
            }
        );
    });

    describe('renameVariant', () => {
        it('persists zero order and clears the suffix while preserving explicit amount fields', async () => {
            await withinTransaction((session) =>
                updateVariantData(
                    { group: 'Daržovės', variant: 'p', order: 1, suffix: 'old', count: 500, units: 'ml' },
                    session
                )
            );

            await expect(
                withinTransaction((session) =>
                    renameVariantData(
                        {
                            group: 'Daržovės',
                            variant: 'p',
                            targetVariant: '1/2',
                            order: 0,
                            suffix: '',
                            count: 500,
                            units: 'ml',
                        },
                        session
                    )
                )
            ).resolves.toBe(true);

            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2', order: 0, count: 500, units: 'ml' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData(
                        {
                            group: 'Daržovės',
                            variant: 'p',
                            targetVariant: '1/2',
                            order: variants[6].order,
                            suffix: variants[6].suffix,
                            count: variants[6].count,
                            units: variants[6].units,
                        },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant of different group', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData(
                        {
                            group: 'Uogienės',
                            variant: 'd',
                            targetVariant: '3/4',
                            order: variants[1].order,
                            suffix: variants[1].suffix,
                            count: variants[1].count,
                            units: variants[1].units,
                        },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { ...variants[1], variant: '3/4' },
                ...variants.slice(2),
            ]);
        });

        it('renames variant and set updated fields', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData(
                        { group: 'Daržovės', variant: 'p', targetVariant: '1/2', order: 1, suffix: '½' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2', suffix: '½' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant and sets count and units', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData(
                        { group: 'Daržovės', variant: 'p', targetVariant: '1/2', count: 500, units: 'ml' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2', count: 500, units: 'ml' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant and preserves omitted fields', async () => {
            await expect(
                withinTransaction((session) =>
                    renameVariantData({ group: 'Daržovės', variant: 'p', targetVariant: '1/2', order: 1 }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2' },
                ...variants.slice(7),
            ]);
        });

        it.each`
            title                           | group         | variant | newVariant
            ${'when variants are the same'} | ${'Daržovės'} | ${'p'}  | ${'p'}
            ${'when empty group'}           | ${''}         | ${'p'}  | ${'1/2'}
            ${'from empty variant'}         | ${'Daržovės'} | ${''}   | ${'1/2'}
            ${'to empty variant'}           | ${'Daržovės'} | ${'p'}  | ${''}
        `(
            'does not rename $title',
            async ({ group, variant, newVariant }: { group: string; variant: string; newVariant: string }) => {
                await expect(
                    withinTransaction((session) =>
                        renameVariantData({ group, variant, targetVariant: newVariant }, session)
                    )
                ).resolves.toBe(false);
                await expect($all('variants')).resolves.toStrictEqual(variants);
            }
        );
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            await expect(
                withinTransaction((session) => renameVariantsGroupData('Daržovės', 'Šaldyti', session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti' })),
            ]);
        });

        it('renames different group', async () => {
            await expect(
                withinTransaction((session) => renameVariantsGroupData('Uogienės', 'Šaldyti', session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 5).map((v) => ({ ...v, group: 'Šaldyti' })),
                ...variants.slice(5),
            ]);
        });

        it.each`
            title                         | group         | newGroup
            ${'when groups are the same'} | ${'Daržovės'} | ${'Daržovės'}
            ${'from empty group'}         | ${''}         | ${'Daržovės'}
            ${'from missing group'}       | ${'Šaldyti'}  | ${'Uogienės'}
            ${'to empty group'}           | ${'Daržovės'} | ${''}
        `('does not rename $title', async ({ group, newGroup }: { group: string; newGroup: string }) => {
            await expect(
                withinTransaction((session) => renameVariantsGroupData(group, newGroup, session))
            ).resolves.toBe(false);
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('copyVariant', () => {
        it('copies variant', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData({ group: 'Uogienės', variant: 'e', targetGroup: 'Daržovės' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[3], group: 'Daržovės' }]);
        });

        it('copies variant to new group', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData({ group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[0], group: 'Šaldyti' }]);
        });

        it('copies variant with new name', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Daržovės', targetVariant: 'z' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[0], group: 'Daržovės', variant: 'z' },
            ]);
        });

        it('does not copy variant with new name if already exists in target group', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Daržovės', targetVariant: 'd' },
                        session
                    )
                )
            ).rejects.toThrow(SchemaError.VariantAlreadyExists);
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });

        it('reads and inserts the copy in the same transaction session', async () => {
            const database = await db();
            const col = database.collection('variants');
            const collection = vi.spyOn(database, 'collection').mockReturnValueOnce(col);
            vi.mocked(db).mockResolvedValueOnce(database);
            const read = vi.spyOn(col, 'findOne');
            const insert = vi.spyOn(col, 'insertOne');
            try {
                await expect(
                    withinTransaction((session) =>
                        copyVariantData({ group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti' }, session)
                    )
                ).resolves.toBe(true);
                expect(withinTransaction).toHaveBeenCalledTimes(1);

                const session = read.mock.calls[0]?.[1]?.session;

                expect(session).toBeDefined();
                expect(read).toHaveBeenCalledTimes(1);
                expect(insert.mock.calls[0]?.[1]?.session).toBe(session);
            } finally {
                collection.mockRestore();
                read.mockRestore();
                insert.mockRestore();
            }
        });

        it('clears an explicitly empty suffix while preserving omitted amount metadata', async () => {
            await (
                await db()
            )
                .collection('variants')
                .updateOne({ group: 'Uogienės', variant: 'p' }, { $set: { suffix: 'kg', count: 5, units: 'kg' } });

            await expect(
                withinTransaction((session) =>
                    copyVariantData({ group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', suffix: '' }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toContainEqual({
                group: 'Šaldyti',
                variant: 'p',
                order: 0,
                count: 5,
                units: 'kg',
            });
        });

        it('copies variant with updated details', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', order: 7, suffix: '1/2' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[0], group: 'Šaldyti', order: 7, suffix: '1/2' },
            ]);
        });

        it('copies variant with order only', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData({ group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', order: 7 }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'p', order: 7 },
            ]);
        });

        it('copies variant with suffix only', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'e', targetGroup: 'Daržovės', suffix: '1/2' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Daržovės', variant: 'e', order: 3, suffix: '1/2' },
            ]);
        });

        it('copies variant with order and suffix', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', order: 7, suffix: '1/2' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'p', order: 7, suffix: '1/2' },
            ]);
        });

        it('copies variant with count and units', async () => {
            await expect(
                withinTransaction((session) =>
                    copyVariantData(
                        { group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', count: 500, units: 'ml' },
                        session
                    )
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'p', order: 0, count: 500, units: 'ml' },
            ]);
        });

        it('preserves count and units from the copied variant when omitted', async () => {
            await expect(
                db().then((d) =>
                    d
                        .collection('variants')
                        .updateOne({ group: 'Uogienės', variant: 'p' }, { $set: { count: 500, units: 'ml' } })
                )
            ).resolves.toBeDefined();

            await expect(
                withinTransaction((session) =>
                    copyVariantData({ group: 'Uogienės', variant: 'p', targetGroup: 'Šaldyti', order: 7 }, session)
                )
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toContainEqual({
                group: 'Šaldyti',
                variant: 'p',
                order: 7,
                count: 500,
                units: 'ml',
            });
        });

        it.each`
            title                   | group         | newGroup      | variant
            ${'to the same group'}  | ${'Daržovės'} | ${'Daržovės'} | ${'p'}
            ${'to empty group'}     | ${'Daržovės'} | ${''}         | ${'p'}
            ${'from missing group'} | ${'Šaldyti'}  | ${'Uogienės'} | ${'p'}
            ${'from empty group'}   | ${''}         | ${'Daržovės'} | ${'p'}
            ${'if empty'}           | ${'Daržovės'} | ${'Uogienės'} | ${''}
            ${'if missing'}         | ${'Daržovės'} | ${'Uogienės'} | ${'z'}
        `(
            'does not copy variant $title',
            async ({ group, newGroup, variant }: { group: string; newGroup: string; variant: string }) => {
                await expect(
                    withinTransaction((session) => copyVariantData({ group, variant, targetGroup: newGroup }, session))
                ).resolves.toBe(false);
                await expect($all('variants')).resolves.toStrictEqual(variants);
            }
        );
    });

    describe('copyVariants', () => {
        it('copies missing variant', async () => {
            await expect(
                withinTransaction((session) => copyVariantsData('Uogienės', 'Daržovės', ['p', 'e'], session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[3], group: 'Daržovės' }]);
        });

        it('copies missing variant to opposite group', async () => {
            await expect(
                withinTransaction((session) => copyVariantsData('Daržovės', 'Uogienės', ['p', '1'], session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[8], group: 'Uogienės' }]);
        });

        it('copies all variants to new group', async () => {
            await expect(
                withinTransaction((session) => copyVariantsData('Uogienės', 'Šaldytos', ['p', 'd'], session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[1], group: 'Šaldytos' },
                { ...variants[0], group: 'Šaldytos' },
            ]);
        });

        it.each`
            title                                  | group         | newGroup      | variantList
            ${'to the same group'}                 | ${'Daržovės'} | ${'Daržovės'} | ${['p', 'd']}
            ${'to empty group'}                    | ${'Daržovės'} | ${''}         | ${['p', 'd']}
            ${'from missing group'}                | ${'Šaldyti'}  | ${'Uogienės'} | ${['p', 'd']}
            ${'from empty group'}                  | ${''}         | ${'Daržovės'} | ${['p', 'd']}
            ${'if empty list'}                     | ${'Daržovės'} | ${'Uogienės'} | ${[]}
            ${'if empty value'}                    | ${'Daržovės'} | ${'Uogienės'} | ${['']}
            ${'if missing'}                        | ${'Daržovės'} | ${'Uogienės'} | ${['w', 'z']}
            ${'if already exists in target group'} | ${'Daržovės'} | ${'Uogienės'} | ${['p', 'd']}
        `(
            'does not copy variants $title',
            async ({ group, newGroup, variantList }: { group: string; newGroup: string; variantList: string[] }) => {
                await expect(
                    withinTransaction((session) => copyVariantsData(group, newGroup, variantList, session))
                ).resolves.toBe(false);
                await expect($all('variants')).resolves.toStrictEqual(variants);
            }
        );
    });

    describe('deleteVariant', () => {
        it('archives variant', async () => {
            await expect(withinTransaction((session) => deleteVariantData('Daržovės', 'p', session))).resolves.toBe(
                true
            );
            expect((await $all('variants')).find((v) => v.group === 'Daržovės' && v.variant === 'p')).toMatchObject({
                archivedAt: expect.any(Number),
            });
        });

        it('archives variant of different group', async () => {
            await expect(withinTransaction((session) => deleteVariantData('Uogienės', 'p', session))).resolves.toBe(
                true
            );
            expect((await $all('variants')).find((v) => v.group === 'Uogienės' && v.variant === 'p')).toMatchObject({
                archivedAt: expect.any(Number),
            });
        });

        it.each`
            title                  | group         | variant
            ${'variant not found'} | ${'Daržovės'} | ${'z'}
            ${'group not found'}   | ${'Šaldyti'}  | ${'p'}
            ${'empty variant'}     | ${'Daržovės'} | ${''}
            ${'empty group'}       | ${''}         | ${'p'}
        `('does not delete when $title', async ({ group, variant }: { group: string; variant: string }) => {
            await expect(withinTransaction((session) => deleteVariantData(group, variant, session))).resolves.toBe(
                false
            );
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('does not remove variants when a category is archived', async () => {
            await expect(withinTransaction((session) => deleteVariantsGroupData('Daržovės', session))).resolves.toBe(
                false
            );
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });

        it.each`
            title                | group
            ${'group not found'} | ${'Šaldyti'}
            ${'empty group'}     | ${''}
        `('does not delete when $title', async ({ group }: { group: string }) => {
            await expect(withinTransaction((session) => deleteVariantsGroupData(group, session))).resolves.toBe(false);
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('reorderVariants', () => {
        it('reorders variants', async () => {
            await expect(
                withinTransaction((session) => reorderVariantsData('Uogienės', { p: 1, d: 0 }, session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], order: 1 },
                { ...variants[1], order: 0 },
                ...variants.slice(2),
            ]);
        });

        it('reorders if at least one variant matches', async () => {
            await expect(
                withinTransaction((session) => reorderVariantsData('Uogienės', { p: 1, z: 0 }, session))
            ).resolves.toBe(true);
            await expect($all('variants')).resolves.toStrictEqual([{ ...variants[0], order: 1 }, ...variants.slice(1)]);
        });

        it.each`
            title                   | group         | update
            ${'order not changed'}  | ${'Uogienės'} | ${{ p: 0, d: 1 }}
            ${'group not found'}    | ${'Šaldyti'}  | ${{ p: 0, d: 1 }}
            ${'variants not found'} | ${'Uogienės'} | ${{ w: 1, z: 0 }}
            ${'empty group'}        | ${''}         | ${{ p: 0, d: 1 }}
            ${'empty update'}       | ${'Uogienės'} | ${{}}
            ${'undefined update'}   | ${'Uogienės'} | ${undefined}
        `('does not reorder when $title', async ({ group, update }: { group: string; update: any }) => {
            await expect(withinTransaction((session) => reorderVariantsData(group, update, session))).resolves.toBe(
                false
            );
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });
});
