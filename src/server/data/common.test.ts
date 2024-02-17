/** @jest-environment node */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ClientSession } from 'mongodb';
import { getTestDetails, getTestGroups, getTestVariants } from '~/tests/fixtures';
import {
    deleteGroupOccurrences,
    deleteVariantOccurrences,
    renameGroupOccurrences,
    renameVariantOccurrences,
} from '~/server/data/common';
import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import {
    getAllDetails,
    getAllGroups,
    getAllVariants,
    LESS_DETAILS_FIELDS,
    LESS_VARIANTS_FIELDS,
} from '~/server/data/tests/utils';
import { deleteVariant, deleteVariantsGroup, renameVariant, renameVariantsGroup } from '~/server/data/variants';
import { getDetailsCollection, getGroupsCollection, getVariantsCollection } from '~/server/db';

jest.mock('~/server/db');

jest.mock('~/server/data/details', () => ({
    ...jest.requireActual('~/server/data/details'),
    deleteDetailsGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/details').deleteDetailsGroup),
    deleteDetailsVariant: jest
        .fn()
        .mockImplementation(jest.requireActual('~/server/data/details').deleteDetailsVariant),
    renameDetailsGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/details').renameDetailsGroup),
    renameDetailsVariant: jest
        .fn()
        .mockImplementation(jest.requireActual('~/server/data/details').renameDetailsVariant),
}));

jest.mock('~/server/data/groups', () => ({
    ...jest.requireActual('~/server/data/groups'),
    deleteGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/groups').deleteGroup),
    renameGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/groups').renameGroup),
}));

jest.mock('~/server/data/variants', () => ({
    ...jest.requireActual('~/server/data/variants'),
    deleteVariant: jest.fn().mockImplementation(jest.requireActual('~/server/data/variants').deleteVariant),
    deleteVariantsGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/variants').deleteVariantsGroup),
    renameVariant: jest.fn().mockImplementation(jest.requireActual('~/server/data/variants').renameVariant),
    renameVariantsGroup: jest.fn().mockImplementation(jest.requireActual('~/server/data/variants').renameVariantsGroup),
}));

describe('common', () => {
    jest.setTimeout(30_000);

    const details = getTestDetails();
    const groups = getTestGroups();
    const variants = getTestVariants();

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

    describe('renameGroupOccurrences', () => {
        it('returns false if renameGroup returns false', async () => {
            (renameGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameGroupOccurrences('G', 'H')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if renameVariantsGroup returns false', async () => {
            (renameVariantsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameGroupOccurrences('G', 'H')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if renameDetailsGroup returns false', async () => {
            (renameDetailsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameGroupOccurrences('G', 'H')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns true if all functions returns true', async () => {
            expect(await renameGroupOccurrences('G', 'H')).toBeTrue();
            expect(renameGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameVariantsGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(renameDetailsGroup).toHaveBeenCalledWith('G', 'H', session);
            expect(await getAllGroups()).toEqual([
                { group: 'H', order: 2 },
                { group: 'J', order: 1 },
            ]);
            expect(await getAllVariants(LESS_VARIANTS_FIELDS)).toEqual([
                { group: 'J', variant: 'p', order: 0 },
                { group: 'J', variant: 'd', order: 1 },
                { group: 'J', variant: 'm', order: 2 },
                { group: 'J', variant: 'e', order: 3 },
                { group: 'J', variant: 'x', order: 4 },
                { group: 'H', variant: 'd', order: 0 },
                { group: 'H', variant: 'p', order: 1 },
                { group: 'H', variant: 'm', order: 2 },
                { group: 'H', variant: '1', order: 3 },
                { group: 'H', variant: 'x', order: 4 },
            ]);
            expect(await getAllDetails(LESS_DETAILS_FIELDS)).toEqual([
                {
                    group: 'J',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p' }] }],
                    updates: [
                        {
                            years: [
                                { year: 20, amounts: [{ variant: 'p' }] },
                                { year: 21, amounts: [{ variant: 'p' }] },
                            ],
                        },
                        {
                            years: [
                                { year: 21, amounts: [{ variant: 'p' }] },
                                { year: 22, amounts: [{ variant: 'p' }] },
                            ],
                        },
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                    ],
                },
                {
                    group: 'J',
                    name: 'B',
                    years: [{ year: 22, amounts: [{ variant: 'p' }] }],
                    updates: [
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                    ],
                },
                {
                    group: 'H',
                    name: 'A',
                    years: [{ year: 22, amounts: [{ variant: 'd' }] }],
                    updates: [
                        { years: [{ year: 22, amounts: [{ variant: 'd' }] }] },
                        { years: [{ year: 22, amounts: [{ variant: 'd' }] }] },
                    ],
                },
                {
                    group: 'H',
                    name: 'C',
                    years: [{ year: 21, amounts: [{ variant: 'p' }] }],
                },
            ]);
        });

        it('does nothing if group not found', async () => {
            expect(await renameGroupOccurrences('H', 'G')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('H', 'G', session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if groups are the same', async () => {
            expect(await renameGroupOccurrences('G', 'G')).toBeFalse();
            expect(renameGroup).toHaveBeenCalledWith('G', 'G', session);
            expect(renameVariantsGroup).not.toHaveBeenCalled();
            expect(renameDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteGroupOccurrences', () => {
        it('returns false if deleteGroup returns false', async () => {
            (deleteGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteGroupOccurrences('G')).toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('G', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if deleteVariantsGroup returns false', async () => {
            (deleteVariantsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteGroupOccurrences('G')).toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('G', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('G', session);
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if deleteDetailsGroup returns false', async () => {
            (deleteDetailsGroup as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteGroupOccurrences('G')).toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('G', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('G', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('G', session);
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns true if all functions returns true', async () => {
            expect(await deleteGroupOccurrences('G')).toBeTrue();
            expect(deleteGroup).toHaveBeenCalledWith('G', session);
            expect(deleteVariantsGroup).toHaveBeenCalledWith('G', session);
            expect(deleteDetailsGroup).toHaveBeenCalledWith('G', session);
            expect(await getAllGroups()).toEqual([{ group: 'J', order: 1 }]);
            expect(await getAllVariants(LESS_VARIANTS_FIELDS)).toEqual([
                { group: 'J', variant: 'p', order: 0 },
                { group: 'J', variant: 'd', order: 1 },
                { group: 'J', variant: 'm', order: 2 },
                { group: 'J', variant: 'e', order: 3 },
                { group: 'J', variant: 'x', order: 4 },
            ]);
            expect(await getAllDetails(LESS_DETAILS_FIELDS)).toEqual([
                {
                    group: 'J',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p' }] }],
                    updates: [
                        {
                            years: [
                                { year: 20, amounts: [{ variant: 'p' }] },
                                { year: 21, amounts: [{ variant: 'p' }] },
                            ],
                        },
                        {
                            years: [
                                { year: 21, amounts: [{ variant: 'p' }] },
                                { year: 22, amounts: [{ variant: 'p' }] },
                            ],
                        },
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                    ],
                },
                {
                    group: 'J',
                    name: 'B',
                    years: [{ year: 22, amounts: [{ variant: 'p' }] }],
                    updates: [
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                        { years: [{ year: 22, amounts: [{ variant: 'p' }] }] },
                    ],
                },
            ]);
        });

        it('does nothing if group not found', async () => {
            expect(await deleteGroupOccurrences('H')).toBeFalse();
            expect(deleteGroup).toHaveBeenCalledWith('H', session);
            expect(deleteVariantsGroup).not.toHaveBeenCalled();
            expect(deleteDetailsGroup).not.toHaveBeenCalled();
            expect(await getAllGroups()).toEqual(groups);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('renameVariantOccurrences', () => {
        it('returns false if renameVariant returns false', async () => {
            (renameVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameVariantOccurrences('G', 'd', 'b')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('G', 'd', 'b', session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if renameDetailsVariant returns false', async () => {
            (renameDetailsVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await renameVariantOccurrences('G', '', '2')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('G', '', '2', session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('G', '', '2', session);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns true if all functions returns true', async () => {
            expect(await renameVariantOccurrences('G', '', '2')).toBeTrue();
            expect(renameVariant).toHaveBeenCalledWith('G', '', '2', session);
            expect(renameDetailsVariant).toHaveBeenCalledWith('G', '', '2', session);
            expect(await getAllVariants()).toEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '2' },
                ...variants.slice(7),
            ]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 3),
                {
                    group: 'G',
                    name: 'C',
                    years: [{ year: 21, amounts: [{ variant: '2', amount: 2 }], removing: true }],
                },
                ...details.slice(4),
            ]);
        });

        it('does nothing if variant not found', async () => {
            expect(await renameVariantOccurrences('G', 'b', 'd')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('G', 'b', 'd', session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if group not found', async () => {
            expect(await renameVariantOccurrences('H', 'd', 'b')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('H', 'd', 'b', session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if variants are the same', async () => {
            expect(await renameVariantOccurrences('G', 'd', 'd')).toBeFalse();
            expect(renameVariant).toHaveBeenCalledWith('G', 'd', 'd', session);
            expect(renameDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteVariantOccurrences', () => {
        it('returns false if deleteVariant returns false', async () => {
            (deleteVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteVariantOccurrences('G', 'd')).toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('G', 'd', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns false if deleteDetailsVariant returns false', async () => {
            (deleteDetailsVariant as jest.Mock).mockResolvedValueOnce(false);
            expect(await deleteVariantOccurrences('G', '')).toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('G', '', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('G', '', session);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('returns true if all functions returns true', async () => {
            expect(await deleteVariantOccurrences('G', '')).toBeTrue();
            expect(deleteVariant).toHaveBeenCalledWith('G', '', session);
            expect(deleteDetailsVariant).toHaveBeenCalledWith('G', '', session);
            expect(await getAllVariants()).toEqual([...variants.slice(0, 6), ...variants.slice(7)]);
            expect(await getAllDetails()).toEqual([
                ...details.slice(0, 3),
                {
                    group: 'G',
                    name: 'C',
                },
                ...details.slice(4),
            ]);
        });

        it('does nothing if variant not found', async () => {
            expect(await deleteVariantOccurrences('G', '3/2')).toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('G', '3/2', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if group not found', async () => {
            expect(await deleteVariantOccurrences('H', '1.5')).toBeFalse();
            expect(deleteVariant).toHaveBeenCalledWith('H', '1.5', session);
            expect(deleteDetailsVariant).not.toHaveBeenCalled();
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllVariants()).toEqual(variants);
            expect(await getAllDetails()).toEqual(details);
        });
    });
});
