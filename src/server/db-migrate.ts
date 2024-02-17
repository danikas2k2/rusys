import nedb from 'nedb-promises';
import path from 'path';
import { type Details, type Group, type Variant } from '~/common/types';
import { getDetailsCollection, getGroupsCollection, getVariantsCollection } from '~/server/db';

type DeprecatedDetails = { group?: string; name: string } & Record<string, Record<string, number>>;
type DeprecatedMissing = { missing: (string | { group?: string; name: string })[] };
type DeprecatedRemoving = { group?: string; name: string } & Record<string, Record<string, boolean>>;
type DeprecatedUpdates = { group?: string; name: string; time: number } & Record<string, Record<string, number>>;

(async () => {
    const dbPath = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');

    const DETAILS = nedb.create({
        filename: path.resolve(dbPath, 'details.jsonl'),
        autoload: true,
    }) as nedb<DeprecatedDetails>;
    const details = (await DETAILS.find({}, { _id: 0 })) as DeprecatedDetails[];

    const MISSING = nedb.create({
        filename: path.resolve(dbPath, 'missing.jsonl'),
        autoload: true,
    }) as nedb<DeprecatedMissing>;
    const missing = (await MISSING.findOne({}, { _id: 0 }))?.missing ?? [];

    const REMOVING = nedb.create({
        filename: path.resolve(dbPath, 'removing.jsonl'),
        autoload: true,
    }) as nedb<DeprecatedRemoving>;
    const removing = (await REMOVING.find({}, { _id: 0 })) as DeprecatedRemoving[];

    const UPDATES = nedb.create({
        filename: path.resolve(dbPath, 'updates.jsonl'),
        autoload: true,
    }) as nedb<DeprecatedUpdates>;
    const updates = (await UPDATES.find({}, { _id: 0 })) as DeprecatedUpdates[];

    const groups: Group[] = [{ group: 'Uogienės', order: 0 }];

    const variants: Variant[] = [
        {
            group: 'Uogienės',
            variant: 'Puslitris',
            order: 0,
            long: '500 ml.',
            short: '', // '½', '1/2',
        },
        {
            group: 'Uogienės',
            variant: 'Didesnis',
            order: 1,
            long: '750 ml.',
            short: 'd', // '¾', '3/4',
        },
        {
            group: 'Uogienės',
            variant: 'Mažesnis',
            order: 2,
            long: '250 ml.',
            short: 'm', // '¼', '1/4',
        },
        {
            group: 'Uogienės',
            variant: 'Eglytės',
            order: 3,
            // long: 'Eglytės', // 0.01l
            short: 'e',
        },
        {
            group: 'Uogienės',
            variant: 'Litras',
            order: 4,
            long: '1 l.',
            short: '1',
        },
        {
            group: 'Uogienės',
            variant: 'Pusantro',
            order: 5,
            long: '1.5 l.',
            short: '1½',
        },
        {
            group: 'Uogienės',
            variant: 'Dvilitris',
            order: 6,
            long: '2 l.',
            short: '2',
        },
        {
            group: 'Uogienės',
            variant: 'Trilitris',
            order: 7,
            long: '3 l.',
            short: '3',
        },
        {
            group: 'Uogienės',
            variant: 'Blogas/Cypė',
            order: 8,
            long: 'Blogas',
            short: '×',
        },
    ];

    const newDetails: Details[] = details.map(
        ({ group = '', name, ...values }): Details => ({
            group: group || 'Uogienės',
            name,
            years: Object.entries(values).map(([year, amounts]) => ({
                year: +year,
                amounts: Object.entries(amounts).map(([variant, amount]) => ({
                    variant: variants.find((v) => v.short === variant)?.variant || 'Puslitris',
                    amount,
                })),
                removing: removing.some((v) => (v.group ?? '') === group && v.name === name && v[+year]),
            })),
            missing: missing.some((v) =>
                typeof v === 'string' ? !group && v === name : (v.group ?? '') === group && v.name === name
            ),
            updates: updates
                .filter((v) => (v.group ?? '') === group && v.name === name)
                .map(({ group: _group, name: _name, time, ...values }) => ({
                    time,
                    years: Object.entries(values).map(([year, amounts]) => ({
                        year: +year,
                        amounts: Object.entries(amounts).map(([variant, amount]) => ({
                            variant: variants.find((v) => v.short === variant)?.variant || 'Puslitris',
                            amount,
                        })),
                    })),
                })),
        })
    );
    console.info(`Migrating ${newDetails.length} details...`);
    await (
        await getDetailsCollection()
    ).bulkWrite([
        { deleteMany: { filter: {} } },
        ...newDetails.map((v) => ({
            replaceOne: { filter: { group: v.group, name: v.name }, replacement: v, upsert: true },
        })),
    ]);

    console.info(`Migrating ${groups.length} groups...`);
    await (
        await getGroupsCollection()
    ).bulkWrite([
        { deleteMany: { filter: {} } },
        ...groups.map((v) => ({
            replaceOne: { filter: { group: v.group }, replacement: v, upsert: true },
        })),
    ]);

    console.info(`Migrating ${variants.length} variants...`);
    await (
        await getVariantsCollection()
    ).bulkWrite([
        { deleteMany: { filter: {} } },
        ...variants.map((v) => ({
            replaceOne: { filter: { group: v.group, variant: v.variant }, replacement: v, upsert: true },
        })),
    ]);

    console.info('Done!');
    process.exit();
})();
