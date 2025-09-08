/** @jest-environment node */
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import {
    deleteGroupOccurrences,
    deleteVariantOccurrences,
    exportEverything,
    importEverything,
    moveDetailsOccurrences,
    renameGroupOccurrences,
    renameVariantOccurrences,
} from '~/server/data/common';
import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    getDetailsVariants,
    moveDetails,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { $all } from '~/server/data/tests/utils';
import {
    copyVariants,
    deleteVariant,
    deleteVariantsGroup,
    renameVariant,
    renameVariantsGroup,
} from '~/server/data/variants';
import { db } from '~/server/db';
import moment from 'moment';
import { AggregationCursor, ClientSession, Collection, Db } from 'mongodb';

jest.setTimeout(30_000);

jest.mock('~/server/db');

jest.mock('~/server/data/details', () => {
    const actual = jest.requireActual('~/server/data/details');
    return {
        ...actual,
        moveDetails: jest.fn(actual.moveDetails),
        getDetailsVariants: jest.fn(actual.getDetailsVariants),
        deleteDetailsGroup: jest.fn(actual.deleteDetailsGroup),
        deleteDetailsVariant: jest.fn(actual.deleteDetailsVariant),
        renameDetailsGroup: jest.fn(actual.renameDetailsGroup),
        renameDetailsVariant: jest.fn(actual.renameDetailsVariant),
    };
});

jest.mock('~/server/data/groups', () => {
    const actual = jest.requireActual('~/server/data/groups');
    return {
        ...actual,
        deleteGroup: jest.fn(actual.deleteGroup),
        renameGroup: jest.fn(actual.renameGroup),
    };
});

jest.mock('~/server/data/variants', () => {
    const actual = jest.requireActual('~/server/data/variants');
    return {
        ...actual,
        copyVariants: jest.fn(actual.copyVariants),
        deleteVariant: jest.fn(actual.deleteVariant),
        deleteVariantsGroup: jest.fn(actual.deleteVariantsGroup),
        renameVariant: jest.fn(actual.renameVariant),
        renameVariantsGroup: jest.fn(actual.renameVariantsGroup),
    };
});

describe('common', () => {
    const details = getDetailsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    beforeEach(async () => {
        const options = { forceServerObjectId: true };
        const d = await db();
        await d.collection('details').insertMany(details, options);
        await d.collection('variants').insertMany(variants, options);
        await d.collection('groups').insertMany(groups, options);
    });

    afterEach(async () => {
        const d = await db();
        await d.collection('details').deleteMany({});
        await d.collection('variants').deleteMany({});
        await d.collection('groups').deleteMany({});
        jest.clearAllMocks();
    });

    const session = expect.any(ClientSession);

    describe('moveDetailsOccurrences', () => {
        it('moves details occurrences, returns true', async () => {
            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(getDetailsVariants).toHaveBeenCalledWith('Šaldyti', 'Agurkai', session);
            expect(copyVariants).toHaveBeenCalledWith('Daržovės', 'Šaldyti', ['d'], session);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'd', order: 0 },
            ]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 2),
                { ...details[2], group: 'Šaldyti' },
                ...details.slice(3),
            ]);
        });

        it('moves details occurrences with new name, returns true', async () => {
            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai')).resolves.toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai', session);
            expect(getDetailsVariants).toHaveBeenCalledWith('Šaldyti', 'Agurkėliai', session);
            expect(copyVariants).toHaveBeenCalledWith('Daržovės', 'Šaldyti', ['d'], session);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'd', order: 0 },
            ]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 2),
                { ...details[2], group: 'Šaldyti', name: 'Agurkėliai' },
                ...details.slice(3),
            ]);
        });

        it.each`
            title           | value
            ${'empty list'} | ${[]}
            ${'undefined'}  | ${undefined}
        `('returns true but does not copy variants if getDetailsVariants returns $title', async ({ value }) => {
            jest.mocked(getDetailsVariants).mockResolvedValueOnce(value);

            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(getDetailsVariants).toHaveBeenCalledWith('Šaldyti', 'Agurkai', session);
            expect(copyVariants).not.toHaveBeenCalledWith();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 2),
                { ...details[2], group: 'Šaldyti', name: 'Agurkai' },
                ...details.slice(3),
            ]);
        });

        it('returns false if moveDetails returns false', async () => {
            jest.mocked(moveDetails).mockResolvedValueOnce(false);

            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBeFalse();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(getDetailsVariants).not.toHaveBeenCalled();
            expect(copyVariants).not.toHaveBeenCalledWith();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if moveDetails fails', async () => {
            jest.mocked(moveDetails).mockRejectedValueOnce('Failed to move details');

            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).rejects.toBe(
                'Failed to move details'
            );
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(getDetailsVariants).not.toHaveBeenCalled();
            expect(copyVariants).not.toHaveBeenCalledWith();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if copyVariants fails', async () => {
            jest.mocked(copyVariants).mockRejectedValueOnce('Failed to rename variants group');

            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).rejects.toBe(
                'Failed to rename variants group'
            );
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(getDetailsVariants).toHaveBeenCalledWith('Šaldyti', 'Agurkai', session);
            expect(copyVariants).toHaveBeenCalledWith('Daržovės', 'Šaldyti', ['d'], session);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('renameGroupOccurrences', () => {
        it('renames all group occurrences, returns true', async () => {
            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).resolves.toBeTrue();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', true, session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            await expect($all('groups')).resolves.toStrictEqual([
                { ...groups[0], group: 'Šaldyti', annual: true },
                ...groups.slice(1),
            ]);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti' })),
            ]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 2),
                ...details.slice(2).map((d) => ({ ...d, group: 'Šaldyti' })),
            ]);
        });

        it('returns false if renameGroup returns false', async () => {
            jest.mocked(renameGroup).mockResolvedValueOnce(false);

            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).resolves.toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', true, session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if renameGroup fails', async () => {
            jest.mocked(renameGroup).mockRejectedValueOnce('Failed to rename group');

            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).rejects.toBe('Failed to rename group');
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', true, session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if renameVariantsGroup fails', async () => {
            jest.mocked(renameVariantsGroup).mockRejectedValueOnce('Failed to rename variants group');

            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).rejects.toBe('Failed to rename variants group');
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', true, session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if renameDetailsGroup fails', async () => {
            jest.mocked(renameDetailsGroup).mockRejectedValueOnce('Failed to rename details group');

            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).rejects.toBe('Failed to rename details group');
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', true, session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('deleteGroupOccurrences', () => {
        it('deletes all group occurrences, returns true', async () => {
            await expect(deleteGroupOccurrences('Daržovės')).resolves.toBeTrue();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('Daržovės', session);
            await expect($all('groups')).resolves.toStrictEqual(groups.slice(1));
            await expect($all('variants')).resolves.toStrictEqual(variants.slice(0, 5));
            await expect($all('details')).resolves.toStrictEqual(details.slice(0, 2));
        });

        it('returns false if deleteGroup returns false', async () => {
            jest.mocked(deleteGroup).mockResolvedValueOnce(false);

            await expect(deleteGroupOccurrences('Daržovės')).resolves.toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if deleteGroup fails', async () => {
            jest.mocked(deleteGroup).mockRejectedValueOnce('Failed to delete group');

            await expect(deleteGroupOccurrences('Daržovės')).rejects.toBe('Failed to delete group');
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if deleteVariantsGroup fails', async () => {
            jest.mocked(deleteVariantsGroup).mockRejectedValueOnce('Failed to delete variants group');

            await expect(deleteGroupOccurrences('Daržovės')).rejects.toBe('Failed to delete variants group');
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if deleteDetailsGroup fails', async () => {
            jest.mocked(deleteDetailsGroup).mockRejectedValueOnce('Failed to delete details group');

            await expect(deleteGroupOccurrences('Daržovės')).rejects.toBe('Failed to delete details group');
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('Daržovės', session);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('renameVariantOccurrences', () => {
        it('renames all variant occurrences, returns true', async () => {
            await expect(renameVariantOccurrences('Daržovės', 'p', '2')).resolves.toBeTrue();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', undefined, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', session);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '2' },
                ...variants.slice(7),
            ]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 3),
                { ...details[3], years: [{ ...details[3].years![0], amounts: [{ variant: '2', amount: 2 }] }] },
                ...details.slice(4),
            ]);
        });

        it('updates and renames all variant occurrences, returns true', async () => {
            const update = { suffix: '2l' };

            await expect(renameVariantOccurrences('Daržovės', 'p', '2', update)).resolves.toBeTrue();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', update, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', session);
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '2', ...update },
                ...variants.slice(7),
            ]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 3),
                { ...details[3], years: [{ ...details[3].years![0], amounts: [{ variant: '2', amount: 2 }] }] },
                ...details.slice(4),
            ]);
        });

        it('returns false if renameVariant returns false', async () => {
            jest.mocked(renameVariant).mockResolvedValueOnce(false);

            await expect(renameVariantOccurrences('Daržovės', 'd', 'b')).resolves.toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if renameVariant fails', async () => {
            jest.mocked(renameVariant).mockRejectedValueOnce('Failed to rename variant');

            await expect(renameVariantOccurrences('Daržovės', 'd', 'b')).rejects.toBe('Failed to rename variant');
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if renameDetailsVariant rejects', async () => {
            jest.mocked(renameDetailsVariant).mockRejectedValueOnce('Failed to rename details variant');

            await expect(renameVariantOccurrences('Daržovės', 'd', 'b')).rejects.toBe(
                'Failed to rename details variant'
            );
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', session);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('deleteVariantOccurrences', () => {
        it('removes all variant occurrences, returns true', async () => {
            await expect(deleteVariantOccurrences('Daržovės', 'p')).resolves.toBeTrue();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            await expect($all('variants')).resolves.toStrictEqual([...variants.slice(0, 6), ...variants.slice(7)]);
            await expect($all('details')).resolves.toStrictEqual([
                ...details.slice(0, 3),
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                },
                ...details.slice(4),
            ]);
        });

        it('returns false if deleteVariant returns false', async () => {
            jest.mocked(deleteVariant).mockResolvedValueOnce(false);

            await expect(deleteVariantOccurrences('Daržovės', 'd')).resolves.toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'd', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if deleteVariant fails', async () => {
            jest.mocked(deleteVariant).mockRejectedValueOnce('Failed to delete variant');

            await expect(deleteVariantOccurrences('Daržovės', 'd')).rejects.toBe('Failed to delete variant');
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'd', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('rejects if deleteDetailsVariant fails', async () => {
            jest.mocked(deleteDetailsVariant).mockRejectedValueOnce('Failed to delete details variant');

            await expect(deleteVariantOccurrences('Daržovės', 'p')).rejects.toBe('Failed to delete details variant');
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            await expect($all('variants')).resolves.toStrictEqual(variants);
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('exportEverything', () => {
        it('retrieves all details, groups, and variants', async () => {
            const result = await exportEverything();

            expect(result.details).toStrictEqual(details);
            expect(result.groups).toStrictEqual(groups);
            expect(result.variants).toStrictEqual(variants);
        });

        it('handles an empty database', async () => {
            const d = await db();
            await d.collection('details').deleteMany({});
            await d.collection('variants').deleteMany({});
            await d.collection('groups').deleteMany({});

            const result = await exportEverything();

            expect(result.details).toStrictEqual([]);
            expect(result.groups).toStrictEqual([]);
            expect(result.variants).toStrictEqual([]);
        });
    });

    describe('importEverything', () => {
        beforeEach(() =>
            jest
                .useFakeTimers({ doNotFake: ['nextTick'] }) // do not fake nextTick behavior for mongo in memory
                .setSystemTime(moment('2025-05-05T12:11:10.123Z').valueOf())
        );

        afterAll(() => jest.useRealTimers());

        it('inserts data into the database and returns true', async () => {
            await expect(importEverything(details, variants, groups)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(details);
            await expect($all('groups')).resolves.toStrictEqual(groups);
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });

        it('rejects if inserting fails', async () => {
            jest.spyOn(Collection.prototype, 'insertMany').mockRejectedValueOnce('Failed to insert many');

            await expect(importEverything(details, variants, groups)).rejects.toBe('Failed to insert many');
        });

        it('rejects if inserting does nothing', async () => {
            jest.spyOn(Collection.prototype, 'insertMany').mockResolvedValueOnce({
                acknowledged: true,
                insertedCount: 0,
                insertedIds: [],
            });

            await expect(importEverything(details, variants, groups)).rejects.toThrow(
                'Failed to insert data into temporary database'
            );
        });

        it('rejects if copying fails', async () => {
            jest.spyOn(AggregationCursor.prototype, 'toArray').mockRejectedValueOnce('Failed to aggregate');

            await expect(importEverything(details, variants, groups)).rejects.toBe('Failed to aggregate');
        });

        it('rejects if copying does nothing', async () => {
            jest.spyOn(Collection.prototype, 'countDocuments').mockResolvedValueOnce(0);

            await expect(importEverything(details, variants, groups)).rejects.toThrow(
                'Failed to move original data to backup database'
            );
        });

        it('rejects if drop database fails', async () => {
            jest.spyOn(Db.prototype, 'dropDatabase').mockRejectedValueOnce('Failed to drop database');

            await expect(importEverything(details, variants, groups)).rejects.toBe('Failed to drop database');
        });

        it('rejects if drop database does nothing', async () => {
            jest.spyOn(Db.prototype, 'dropDatabase').mockResolvedValueOnce(false);

            await expect(importEverything(details, variants, groups)).rejects.toThrow(
                'Failed to move original data to backup database'
            );
        });

        it('rejects if second drop database does nothing', async () => {
            jest.spyOn(Db.prototype, 'dropDatabase').mockResolvedValueOnce(true).mockResolvedValueOnce(false);

            await expect(importEverything(details, variants, groups)).rejects.toThrow(
                'Failed to move data from temporary database to original database'
            );
        });
    });
});
