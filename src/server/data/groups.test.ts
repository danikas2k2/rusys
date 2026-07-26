/** @vitest-environment node */
import { getGroupsFixture } from '@tests/fixtures';

import { deleteGroup, getGroups, renameGroup, reorderGroups, updateGroup } from '~/server/data/groups';
import { db } from '~/server/db';

vi.mock(import('~/server/db'));

describe('groups', () => {
    const groups = getGroupsFixture().sort((a, b) => a.order - b.order);

    beforeEach(async () => {
        await (await db()).collection('groups').insertMany(getGroupsFixture());
    });

    afterEach(async () => {
        await (await db()).collection('groups').deleteMany({});
        vi.clearAllMocks();
    });

    describe('getGroups', () => {
        it('returns groups sorted by order and name', async () => {
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('updateGroup', () => {
        it('updates a group with annual field = false', async () => {
            await expect(updateGroup('Daržovės', false)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: false, review: false },
            ]);
        });

        it('updates a group with annual field = true', async () => {
            await expect(updateGroup('Daržovės', true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group without annual field', async () => {
            await expect(updateGroup('Daržovės')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                groups[0],
                { ...groups[1], annual: true, review: false },
            ]);
        });

        it('updates a group with review = true', async () => {
            await expect(updateGroup('Daržovės', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([groups[0], { ...groups[1], annual: true, review: true }]);
        });

        it('adds a new group to empty collection without order field', async () => {
            await (await db()).collection('groups').deleteMany({});

            await expect(updateGroup('Šaldyti')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Šaldyti', order: 0, annual: true, review: false },
            ]);
        });

        it('adds a group', async () => {
            await expect(updateGroup('Šaldyti')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Šaldyti', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = true', async () => {
            await expect(updateGroup('Grybai', true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: false },
            ]);
        });

        it('adds a group with annual = false', async () => {
            await expect(updateGroup('Kruopos', false)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Kruopos', order: 3, annual: false, review: false },
            ]);
        });

        it('adds a group with review = true', async () => {
            await expect(updateGroup('Grybai', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                ...groups,
                { group: 'Grybai', order: 3, annual: true, review: true },
            ]);
        });

        it('does nothing if group is not updated', async () => {
            await updateGroup('Uogienės', true, false);

            await expect(updateGroup('Uogienės', true, false)).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual([{ ...groups[0], review: false }, groups[1]]);
        });

        it('does nothing for empty group', async () => {
            await expect(updateGroup('', true)).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('updateGroupOrders', () => {
        it('updates group orders', async () => {
            await expect(reorderGroups({ Daržovės: 1, Uogienės: 3 })).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 1 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('updates single group order', async () => {
            await expect(reorderGroups({ Uogienės: 3 })).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Daržovės', order: 2 },
                { group: 'Uogienės', order: 3, annual: true },
            ]);
        });

        it('does nothing for undefined data', async () => {
            await expect(reorderGroups()).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty object', async () => {
            await expect(reorderGroups({})).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if no groups are updated', async () => {
            await expect(reorderGroups({ G: 2, J: 1 })).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('renameGroup', () => {
        it('renames a group', async () => {
            await expect(renameGroup('Uogienės', 'Grybai')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: false },
                groups[1],
            ]);
        });

        it('renames a group with review = true', async () => {
            await expect(renameGroup('Uogienės', 'Grybai', true, true)).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual([
                { group: 'Grybai', order: 1, annual: true, review: true },
                groups[1],
            ]);
        });

        it('does nothing if new name is the same as old name', async () => {
            await expect(renameGroup('Daržovės', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if new name already exists', async () => {
            await expect(renameGroup('Daržovės', 'Uogienės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(renameGroup('Šaldyti', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for empty group', async () => {
            await expect(renameGroup('', 'Daržovės')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing for new empty group', async () => {
            await expect(renameGroup('Daržovės', '')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });

    describe('deleteGroup', () => {
        it('deletes a group', async () => {
            await expect(deleteGroup('Uogienės')).resolves.toBe(true);
            await expect(getGroups()).resolves.toStrictEqual(groups.slice(1));
        });

        it('does nothing with empty group', async () => {
            await expect(deleteGroup('')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });

        it('does nothing if group does not exists', async () => {
            await expect(deleteGroup('Šaldyti')).resolves.toBe(false);
            await expect(getGroups()).resolves.toStrictEqual(groups);
        });
    });
});
