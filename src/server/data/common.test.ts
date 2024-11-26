/** @jest-environment node */

import { ClientSession } from 'mongodb';
import {
    deleteGroupOccurrences,
    deleteVariantOccurrences,
    moveDetailsOccurrences,
    renameGroupOccurrences,
    renameVariantOccurrences,
} from '~/server/data/common';
import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    moveDetails,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { getAllDetails, getAllGroups, getAllVariants } from '~/server/data/tests/utils';
import {
    copyDetailsVariants,
    deleteVariant,
    deleteVariantsGroup,
    renameVariant,
    renameVariantsGroup,
} from '~/server/data/variants';
import { getDetailsCollection, getGroupsCollection, getVariantsCollection } from '~/server/db';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '~/tests/fixtures';

jest.mock('~/server/db');

jest.mock('~/server/data/details', () => {
    const actual = jest.requireActual('~/server/data/details');
    return {
        ...actual,
        moveDetails: jest.fn().mockImplementation(actual.moveDetails),
        deleteDetailsGroup: jest.fn().mockImplementation(actual.deleteDetailsGroup),
        deleteDetailsVariant: jest.fn().mockImplementation(actual.deleteDetailsVariant),
        renameDetailsGroup: jest.fn().mockImplementation(actual.renameDetailsGroup),
        renameDetailsVariant: jest.fn().mockImplementation(actual.renameDetailsVariant),
    };
});

jest.mock('~/server/data/groups', () => {
    const actual = jest.requireActual('~/server/data/groups');
    return {
        ...actual,
        deleteGroup: jest.fn().mockImplementation(actual.deleteGroup),
        renameGroup: jest.fn().mockImplementation(actual.renameGroup),
    };
});

jest.mock('~/server/data/variants', () => {
    const actual = jest.requireActual('~/server/data/variants');
    return {
        ...actual,
        copyDetailsVariants: jest.fn().mockImplementation(actual.copyDetailsVariants),
        deleteVariant: jest.fn().mockImplementation(actual.deleteVariant),
        deleteVariantsGroup: jest.fn().mockImplementation(actual.deleteVariantsGroup),
        renameVariant: jest.fn().mockImplementation(actual.renameVariant),
        renameVariantsGroup: jest.fn().mockImplementation(actual.renameVariantsGroup),
    };
});

describe('common', () => {
    jest.setTimeout(30_000);

    const details = getDetailsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    beforeEach(async () => {
        await (await getDetailsCollection()).insertMany(details, { forceServerObjectId: true });
        await (await getGroupsCollection()).insertMany(groups, { forceServerObjectId: true });
        await (await getVariantsCollection()).insertMany(variants, { forceServerObjectId: true });
    });

    afterEach(async () => {
        await (await getDetailsCollection()).deleteMany({});
        await (await getGroupsCollection()).deleteMany({});
        await (await getVariantsCollection()).deleteMany({});
        jest.clearAllMocks();
    });

    const session = expect.any(ClientSession);

    describe('moveDetailsOccurrences', () => {
        it('moves details occurrences, returns true', async () => {
            expect(await moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(copyDetailsVariants).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'd', long: '3 l.', order: 0 },
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 2),
                { ...details[2], group: 'Šaldyti' },
                ...details.slice(3),
            ]);
        });

        it('moves details occurrences with new name, returns true', async () => {
            expect(await moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai')).toBeTrue();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai', session);
            expect(copyDetailsVariants).toHaveBeenCalledWith('Daržovės', 'Agurkėliai', 'Šaldyti', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'd', long: '3 l.', order: 0 },
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 2),
                { ...details[2], group: 'Šaldyti', name: 'Agurkėliai' },
                ...details.slice(3),
            ]);
        });

        it('returns false if moveDetails returns false', async () => {
            (moveDetails as jest.Mock).mockResolvedValueOnce(false);
            expect(await moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).toBeFalse();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(copyDetailsVariants).not.toHaveBeenCalledWith();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if moveDetails fails', async () => {
            (moveDetails as jest.Mock).mockRejectedValueOnce('failed to move details');
            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).toReject();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(copyDetailsVariants).not.toHaveBeenCalledWith();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if copyDetailsVariants fails', async () => {
            (copyDetailsVariants as jest.Mock).mockRejectedValueOnce('failed to rename variants group');
            await expect(moveDetailsOccurrences('Daržovės', 'Agurkai', 'Šaldyti')).toReject();
            expect(moveDetails).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', undefined, session);
            expect(copyDetailsVariants).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'Šaldyti', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('renameGroupOccurrences', () => {
        it('renames all group occurrences, returns true', async () => {
            expect(await renameGroupOccurrences('Daržovės', 'Šaldyti')).toBeTrue();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(await getAllGroups()).toEqual([{ ...groups[0], group: 'Šaldyti' }, ...groups.slice(1)]);
            expect(await getAllVariants()).toEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti' })),
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 2),
                ...details.slice(2).map((d) => ({ ...d, group: 'Šaldyti' })),
            ]);
        });

        it('returns false if renameGroup returns false', async () => {
            (renameGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameGroupOccurrences('Daržovės', 'Šaldyti')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if renameGroup fails', async () => {
            (renameGroup as jest.Mock).mockRejectedValueOnce('failed to rename group');
            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).toReject();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if renameVariantsGroup fails', async () => {
            (renameVariantsGroup as jest.Mock).mockRejectedValueOnce('failed to rename variants group');
            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).toReject();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if renameDetailsGroup fails', async () => {
            (renameDetailsGroup as jest.Mock).mockRejectedValueOnce('failed to rename details group');
            await expect(renameGroupOccurrences('Daržovės', 'Šaldyti')).toReject();
            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('Daržovės', 'Šaldyti', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteGroupOccurrences', () => {
        it('deletes all group occurrences, returns true', async () => {
            expect(await deleteGroupOccurrences('Daržovės')).toBeTrue();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(await getAllGroups()).toEqual(groups.slice(1));
            expect(await getAllVariants()).toEqual(variants.slice(0, 5));
            expect(await getAllDetails()).toEqual(details.slice(0, 2));
        });

        it('returns false if deleteGroup returns false', async () => {
            (deleteGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteGroupOccurrences('Daržovės')).toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if deleteGroup fails', async () => {
            (deleteGroup as jest.Mock).mockRejectedValueOnce('failed to delete group');
            await expect(deleteGroupOccurrences('Daržovės')).toReject();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if deleteVariantsGroup fails', async () => {
            (deleteVariantsGroup as jest.Mock).mockRejectedValueOnce('failed to delete variants group');
            await expect(deleteGroupOccurrences('Daržovės')).toReject();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if deleteDetailsGroup fails', async () => {
            (deleteDetailsGroup as jest.Mock).mockRejectedValueOnce('failed to delete details group');
            await expect(deleteGroupOccurrences('Daržovės')).toReject();
            expect(deleteGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('Daržovės', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('renameVariantOccurrences', () => {
        it('renames all variant occurrences, returns true', async () => {
            expect(await renameVariantOccurrences('Daržovės', 'p', '2')).toBeTrue();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', undefined, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', session);
            expect(await getAllVariants()).toEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '2' },
                ...variants.slice(7),
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 3),
                { ...details[3], years: [{ ...details[3].years![0], amounts: [{ variant: '2', amount: 2 }] }] },
                ...details.slice(4),
            ]);
        });

        it('updates and renames all variant occurrences, returns true', async () => {
            const update = { long: 'Du litrai', short: '2l' };
            expect(await renameVariantOccurrences('Daržovės', 'p', '2', update)).toBeTrue();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', update, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', '2', session);
            expect(await getAllVariants()).toEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '2', ...update },
                ...variants.slice(7),
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 3),
                { ...details[3], years: [{ ...details[3].years![0], amounts: [{ variant: '2', amount: 2 }] }] },
                ...details.slice(4),
            ]);
        });

        it('returns false if renameVariant returns false', async () => {
            (renameVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameVariantOccurrences('Daržovės', 'd', 'b')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if renameVariant fails', async () => {
            (renameVariant as jest.Mock).mockRejectedValueOnce('failed to rename variant');
            await expect(renameVariantOccurrences('Daržovės', 'd', 'b')).toReject();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if renameDetailsVariant rejects', async () => {
            (renameDetailsVariant as jest.Mock).mockRejectedValueOnce('failed to rename details variant');
            await expect(renameVariantOccurrences('Daržovės', 'd', 'b')).toReject();
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', undefined, session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('Daržovės', 'd', 'b', session);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteVariantOccurrences', () => {
        it('removes all variant occurrences, returns true', async () => {
            expect(await deleteVariantOccurrences('Daržovės', 'p')).toBeTrue();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(await getAllVariants()).toEqual([...variants.slice(0, 6), ...variants.slice(7)]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 3),
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                },
                ...details.slice(4),
            ]);
        });

        it('returns false if deleteVariant returns false', async () => {
            (deleteVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteVariantOccurrences('Daržovės', 'd')).toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'd', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if deleteVariant fails', async () => {
            (deleteVariant as jest.Mock).mockRejectedValueOnce('failed to delete variant');
            await expect(deleteVariantOccurrences('Daržovės', 'd')).toReject();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'd', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('rejects if deleteDetailsVariant fails', async () => {
            (deleteDetailsVariant as jest.Mock).mockRejectedValueOnce('failed to delete details variant');
            await expect(deleteVariantOccurrences('Daržovės', 'p')).toReject();
            expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('Daržovės', 'p', session);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });
});
