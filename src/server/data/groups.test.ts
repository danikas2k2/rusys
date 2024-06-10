/** @jest-environment node */
import { Group } from '~/common/types';
import { getGroupsFixture } from '~/tests/fixtures';
import { deleteGroup, getGroups, renameGroup, setGroups, updateGroup, reorderGroups } from '~/server/data/groups';
import { getGroupsCollection } from '~/server/db';

jest.mock('~/server/db');

describe('groups', () => {
    jest.setTimeout(30_000);

    const groups = getGroupsFixture().sort((a, b) => a.order - b.order);

    beforeEach(async () => {
        await (await getGroupsCollection()).insertMany(getGroupsFixture());
    });

    afterEach(async () => {
        await (await getGroupsCollection()).deleteMany({});
        jest.clearAllMocks();
    });

    describe('getGroups', () => {
        it('returns groups sorted by order and name', async () => {
            expect(await getGroups()).toEqual(groups);
        });
    });

    describe('setGroups', () => {
        it('updates groups and deletes non-existing ones', async () => {
            expect(
                await setGroups([
                    { group: 'C', order: 2 },
                    { group: 'J', order: 1 },
                ])
            ).toBeTrue();
            expect(await getGroups()).toEqual([
                { group: 'J', order: 1 },
                { group: 'C', order: 2 },
            ]);
        });

        it('updates groups by empty set', async () => {
            expect(await setGroups([])).toBeTrue();
            expect(await getGroups()).toEqual([]);
        });

        it('does nothing if no groups are updated or deleted', async () => {
            expect(
                await setGroups([
                    { group: 'G', order: 2 },
                    { group: 'J', order: 1 },
                ])
            ).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('updates groups ignoring empty names or records', async () => {
            expect(
                await setGroups([{ group: '', order: 1 }, { group: 'C', order: 2 }, { order: 3 } as Group, {} as Group])
            ).toBeTrue();
            expect(await getGroups()).toEqual([{ group: 'C', order: 2 }]);
        });
    });

    describe('updateGroup', () => {
        it('updates a group', async () => {
            expect(await updateGroup('G', 3)).toBeTrue();
            expect(await getGroups()).toEqual([groups[0], { group: 'G', order: 3 }]);
        });

        it('updates a group with order field', async () => {
            expect(await updateGroup('G', 3)).toBeTrue();
            expect(await getGroups()).toEqual([groups[0], { group: 'G', order: 3 }]);
        });

        it('adds a group', async () => {
            expect(await updateGroup('C', 3)).toBeTrue();
            expect(await getGroups()).toEqual([...groups, { group: 'C', order: 3 }]);
        });

        it('adds a group with same order', async () => {
            expect(await updateGroup('D', 1)).toBeTrue();
            expect(await getGroups()).toEqual([{ group: 'D', order: 1 }, ...groups]);
        });

        it('does nothing if group is not updated', async () => {
            expect(await updateGroup('G', 2)).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing for empty group', async () => {
            expect(await updateGroup('', 2)).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });
    });

    describe('updateGroupOrders', () => {
        it('updates group orders', async () => {
            expect(await reorderGroups({ G: 1, J: 3 })).toBeTrue();
            expect(await getGroups()).toEqual([
                { group: 'G', order: 1 },
                { group: 'J', order: 3 },
            ]);
        });

        it('updates single group order', async () => {
            expect(await reorderGroups({ J: 3 })).toBeTrue();
            expect(await getGroups()).toEqual([
                { group: 'G', order: 2 },
                { group: 'J', order: 3 },
            ]);
        });

        it('does nothing for undefined data', async () => {
            expect(await reorderGroups()).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing for empty object', async () => {
            expect(await reorderGroups({})).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing if no groups are updated', async () => {
            expect(await reorderGroups({ G: 2, J: 1 })).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            expect(await renameGroup('J', 'C')).toBeTrue();
            expect(await getGroups()).toEqual([{ group: 'C', order: 1 }, groups[1]]);
        });

        it('does nothing if new name is the same as old name', async () => {
            expect(await renameGroup('G', 'G')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing if new name already exists', async () => {
            expect(await renameGroup('G', 'J')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            expect(await renameGroup('H', 'G')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing for empty group', async () => {
            expect(await renameGroup('', 'G')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing for new empty group', async () => {
            expect(await renameGroup('G', '')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            expect(await deleteGroup('J')).toBeTrue();
            expect(await getGroups()).toEqual(groups.slice(1));
        });

        it('does nothing with empty group', async () => {
            expect(await deleteGroup('')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            expect(await deleteGroup('C')).toBeFalse();
            expect(await getGroups()).toEqual(groups);
        });
    });
});
