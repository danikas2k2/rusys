/** @jest-environment node */
import { getTestGroups } from '~/tests/fixtures';
import { deleteGroup, getGroups, renameGroup, setGroups, updateGroup } from '~/server/data/groups';
import { getGroupsCollection } from '~/server/db';

jest.mock('~/server/db');

describe('groups', () => {
    jest.setTimeout(30_000);

    const testGroups = getTestGroups().sort((a, b) => a.order - b.order);

    beforeEach(async () => {
        await (await getGroupsCollection()).insertMany(getTestGroups());
    });

    afterEach(async () => {
        await (await getGroupsCollection()).deleteMany({});
        jest.clearAllMocks();
    });

    describe('getGroups', () => {
        it('returns groups sorted by order and name', async () => {
            expect(await getGroups()).toEqual(testGroups);
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

        it('adds a new group', async () => {
            expect(await setGroups([{ group: 'D', order: 0 }])).toBeTrue();
            expect(await getGroups()).toEqual([{ group: 'D', order: 0 }]);
        });

        it('does nothing if no groups are updated or deleted', async () => {
            expect(
                await setGroups([
                    { group: 'G', order: 2 },
                    { group: 'J', order: 1 },
                ])
            ).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });
    });

    describe('updateGroupsGroup', () => {
        it('updates a group', async () => {
            expect(await updateGroup('G', 3)).toBeTrue();
            expect(await getGroups()).toEqual([testGroups[0], { group: 'G', order: 3 }]);
        });

        it('updates a group with order field', async () => {
            expect(await updateGroup('G', 3)).toBeTrue();
            expect(await getGroups()).toEqual([testGroups[0], { group: 'G', order: 3 }]);
        });

        it('updates a group with title field', async () => {
            expect(await updateGroup('G', 2)).toBeTrue();
            expect(await getGroups()).toEqual([testGroups[0], { group: 'G', order: 2, title: 'New title' }]);
        });

        it('adds a group', async () => {
            expect(await updateGroup('C', 3)).toBeTrue();
            expect(await getGroups()).toEqual([...testGroups, { group: 'C', order: 3 }]);
        });

        it('adds a group with same order', async () => {
            expect(await updateGroup('D', 1)).toBeTrue();
            expect(await getGroups()).toEqual([testGroups[0], { group: 'D', order: 1 }, testGroups[1]]);
        });

        it('does nothing if group is not updated', async () => {
            expect(await updateGroup('G', 2)).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            expect(await renameGroup('', 'C')).toBeTrue();
            expect(await getGroups()).toEqual([{ group: 'C', order: 1 }, testGroups[1]]);
        });

        it('does nothing if new name is the same as old name', async () => {
            expect(await renameGroup('G', 'G')).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });

        it('does nothing if new name already exists', async () => {
            expect(await renameGroup('G', '')).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });

        it('does nothing if group does not exists', async () => {
            expect(await renameGroup('H', 'G')).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            expect(await deleteGroup('')).toBeTrue();
            expect(await getGroups()).toEqual(testGroups.slice(1));
        });

        it('does nothing if group does not exists', async () => {
            expect(await deleteGroup('C')).toBeFalse();
            expect(await getGroups()).toEqual(testGroups);
        });
    });
});
