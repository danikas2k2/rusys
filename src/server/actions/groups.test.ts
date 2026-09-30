import {
    deleteGroupAction,
    getGroupsAction,
    renameGroupAction,
    reorderGroupsAction,
    updateGroupAction,
} from '~/server/actions/groups';
import { requireSession } from '~/server/auth/session';
import { deleteGroupOccurrences, renameGroupOccurrences } from '~/server/data/common';
import { getGroup, getGroups, reorderGroups, updateGroup } from '~/server/data/groups';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/groups'));

describe('group actions', () => {
    afterEach(() => vi.clearAllMocks());

    it.each([
        ['group identity', () => updateGroupAction(42 as never), updateGroup],
        ['group name', () => renameGroupAction('A', {} as never), renameGroupOccurrences],
        ['deleted group identity', () => deleteGroupAction([] as never), deleteGroupOccurrences],
        ['group order', () => reorderGroupsAction({ A: Infinity }), reorderGroups],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(Error);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it('reads groups after checking the session', async () => {
        const groups = [{ group: 'A', order: 0 }];
        vi.mocked(getGroups).mockResolvedValueOnce(groups);

        await expect(getGroupsAction()).resolves.toStrictEqual(groups);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('updates a group and reports a rejected change', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await updateGroupAction('A', false, true, 'image');

        expect(updateGroup).toHaveBeenCalledWith('A', false, true, 'image');
        await expect(updateGroupAction('A')).rejects.toThrow('The requested change could not be applied');
    });

    it('renames a group using its existing values for omitted fields', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', order: 0, annual: true, review: false, image: 'old' });
        vi.mocked(renameGroupOccurrences).mockResolvedValueOnce(true);
        await renameGroupAction('A', 'B', undefined, true);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('A', 'B', true, true, 'old');
    });

    it('reports a missing group or failed rename', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce(null).mockResolvedValueOnce({ group: 'A', order: 0 });
        vi.mocked(renameGroupOccurrences).mockResolvedValueOnce(false);

        await expect(renameGroupAction('A', 'B')).rejects.toThrow('Group not found');
        await expect(renameGroupAction('A', 'B')).rejects.toThrow('The requested change could not be applied');
    });

    it('deletes and reorders groups, reporting unsuccessful writes', async () => {
        vi.mocked(deleteGroupOccurrences).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        vi.mocked(reorderGroups).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await deleteGroupAction('A');

        await expect(deleteGroupAction('A')).rejects.toThrow('The requested change could not be applied');

        await reorderGroupsAction({ A: 1 });

        await expect(reorderGroupsAction({ A: 1 })).rejects.toThrow('The requested change could not be applied');
    });
});
