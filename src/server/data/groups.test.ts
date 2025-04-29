/** @jest-environment node */
import { getGroupsFixture } from '@tests/fixtures';
import { type Group } from '~/common/types';
import { deleteGroup, getGroups, renameGroup, reorderGroups, setGroups, updateGroup } from '~/server/data/groups';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');

describe('groups', () => {
    const groups = getGroupsFixture().sort((a, b) => a.order - b.order);

    beforeEach(async () => {
        await (await db()).collection('groups').insertMany(getGroupsFixture());
    });

    afterEach(async () => {
        await (await db()).collection('groups').deleteMany({});
        jest.clearAllMocks();
    });

    describe('getGroups', () => {
        it('returns groups sorted by order and name', async () => {
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('setGroups', () => {
        it('updates groups and deletes non-existing ones', async () => {
            await expect(
                setGroups([
                    { group: 'C', order: 2 },
                    { group: 'Uogienės', order: 1 },
                ])
            ).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Uogienės', order: 1 },
                { group: 'C', order: 2 },
            ]);
        });

        it('updates groups by empty set', async () => {
            await expect(setGroups([])).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([]);
        });

        it('does nothing if no groups are updated or deleted', async () => {
            await expect(
                setGroups([
                    { group: 'Daržovės', order: 2 },
                    { group: 'Uogienės', order: 1 },
                ])
            ).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('updates groups ignoring empty names or records', async () => {
            await expect(
                setGroups([{ group: '', order: 1 }, { group: 'C', order: 2 }, { order: 3 } as Group, {} as Group])
            ).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([{ group: 'C', order: 2 }]);
        });
    });

    describe('updateGroup', () => {
        it('updates a group', async () => {
            await expect(updateGroup('Daržovės', 3)).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([groups[0], { group: 'Daržovės', order: 3 }]);
        });

        it('updates a group with order field', async () => {
            await expect(updateGroup('Daržovės', 3)).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([groups[0], { group: 'Daržovės', order: 3 }]);
        });

        it('adds a group', async () => {
            await expect(updateGroup('Šaldyti', 3)).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([...groups, { group: 'Šaldyti', order: 3 }]);
        });

        it('adds a group with same order', async () => {
            await expect(updateGroup('Grybai', 1)).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([{ group: 'Grybai', order: 1 }, ...groups]);
        });

        it('does nothing if group is not updated', async () => {
            await expect(updateGroup('Daržovės', 2)).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty group', async () => {
            await expect(updateGroup('', 2)).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('updateGroupOrders', () => {
        it('updates group orders', async () => {
            await expect(reorderGroups({ Daržovės: 1, Uogienės: 3 })).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 1 },
                { group: 'Uogienės', order: 3 },
            ]);
        });

        it('updates single group order', async () => {
            await expect(reorderGroups({ Uogienės: 3 })).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 2 },
                { group: 'Uogienės', order: 3 },
            ]);
        });

        it('does nothing for undefined data', async () => {
            await expect(reorderGroups()).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty object', async () => {
            await expect(reorderGroups({})).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if no groups are updated', async () => {
            await expect(reorderGroups({ G: 2, J: 1 })).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            await expect(renameGroup('Uogienės', 'Grybai')).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual([{ group: 'Grybai', order: 1 }, groups[1]]);
        });

        it('does nothing if new name is the same as old name', async () => {
            await expect(renameGroup('Daržovės', 'Daržovės')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if new name already exists', async () => {
            await expect(renameGroup('Daržovės', 'Uogienės')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(renameGroup('Šaldyti', 'Daržovės')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty group', async () => {
            await expect(renameGroup('', 'Daržovės')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for new empty group', async () => {
            await expect(renameGroup('Daržovės', '')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            await expect(deleteGroup('Uogienės')).resolves.toBeTrue();
            await expect(getGroups()).resolves.toStrictEqual(groups.slice(1));
        });

        it('does nothing with empty group', async () => {
            await expect(deleteGroup('')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(deleteGroup('C')).resolves.toBeFalse();
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });
});
