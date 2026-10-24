import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

import { SchemaError } from '~/schema';
import {
    deleteGroupAction,
    getGroupsAction,
    renameGroupAction,
    reorderGroupsAction,
    updateGroupAction,
} from '~/server/actions/groups';
import { runApiHandler } from '~/server/api/next';
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';
import { requireSession } from '~/server/auth/session';
import { deleteGroup, getGroup, getGroups, renameGroup, reorderGroups, updateGroup } from '~/server/data/groups';
import { renameProductsGroup } from '~/server/data/products/mutations';
import { renameVariantsGroup } from '~/server/data/variants';
import { withinTransaction } from '~/server/db';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/products/mutations'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/db'), () => ({ withinTransaction: vi.fn() }));

const transactionSession = {} as Parameters<Parameters<typeof withinTransaction>[0]>[0];

describe('group actions', () => {
    beforeEach(() => {
        vi.mocked(getGroups).mockResolvedValue([]);
        vi.mocked(getGroup).mockResolvedValue(null);
        vi.mocked(withinTransaction).mockImplementation((callback) => callback(transactionSession));
    });

    afterEach(() => vi.clearAllMocks());

    it('propagates a duplicate group reported by the transactional data layer', async () => {
        vi.mocked(getGroups).mockResolvedValue([
            { group: 'A', order: 0 },
            { group: 'B', order: 1 },
        ]);

        vi.mocked(renameGroup).mockRejectedValueOnce(new Error(SchemaError.CategoryAlreadyExists));

        await expect(renameGroupAction({ group: 'A', targetGroup: 'b' })).rejects.toThrow(
            SchemaError.CategoryAlreadyExists
        );
        expect(renameGroup).toHaveBeenCalledWith({ group: 'A', targetGroup: 'b' }, transactionSession);
        expect(getGroups).not.toHaveBeenCalled();
    });

    it.each([
        ['group identity', () => updateGroupAction(42 as never), updateGroup],
        ['group name', () => renameGroupAction({ group: 'A', targetGroup: {} as never }), renameGroup],
        ['blank group name', () => updateGroupAction({ group: '   ' }), updateGroup],
        ['colon in group name', () => renameGroupAction({ group: 'A', targetGroup: 'B:C' }), renameGroup],
        ['deleted group identity', () => deleteGroupAction([] as never), deleteGroup],
        ['group order', () => reorderGroupsAction({ groups: { A: Infinity } }), reorderGroups],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it.each([() => updateGroupAction({ group: '   ' }), () => renameGroupAction({ group: 'A', targetGroup: 'B:C' })])(
        'validates malformed group arguments before reading groups',
        async (call) => {
            await expect(call()).rejects.toBeInstanceOf(ZodError);
            expect(getGroups).not.toHaveBeenCalled();
        }
    );

    it('propagates duplicate creation errors without prefetching the catalog', async () => {
        vi.mocked(updateGroup).mockRejectedValueOnce(new Error(SchemaError.CategoryAlreadyExists));

        await expect(updateGroupAction({ group: ' a ' })).rejects.toThrow(SchemaError.CategoryAlreadyExists);
        expect(getGroups).not.toHaveBeenCalled();
        expect(updateGroup).toHaveBeenCalledWith({ group: 'a' }, transactionSession);
    });

    it('handles unchanged names as settings updates without renaming children', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', annual: false, review: true, image: 'old' });
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'A', order: 0 }]);
        vi.mocked(updateGroup).mockResolvedValueOnce(true);
        await renameGroupAction({ group: 'A', targetGroup: ' A ', review: false, image: '' });

        expect(updateGroup).toHaveBeenCalledWith(
            { group: 'A', targetGroup: 'A', review: false, image: '' },
            transactionSession
        );
        expect(renameGroup).not.toHaveBeenCalled();
        expect(renameVariantsGroup).not.toHaveBeenCalled();
        expect(renameProductsGroup).not.toHaveBeenCalled();
    });

    it('reports an unchanged rename when the data layer reports no effect', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', order: 0 });

        vi.mocked(updateGroup).mockResolvedValueOnce(false);

        await expect(renameGroupAction({ group: 'A', targetGroup: ' A ' })).rejects.toThrow(SchemaError.RequestFailed);
        expect(updateGroup).toHaveBeenCalledWith({ group: 'A', targetGroup: 'A' }, transactionSession);
        expect(renameGroup).not.toHaveBeenCalled();
        expect(renameVariantsGroup).not.toHaveBeenCalled();
        expect(renameProductsGroup).not.toHaveBeenCalled();
    });

    it('reports PATCH with an unchanged name when the data layer reports no effect', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', order: 0 });
        vi.mocked(updateGroup).mockResolvedValue(false);
        const request = new NextRequest('http://localhost/api/v1/groups/A', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetGroup: ' A ' }),
        });

        const response = await runApiHandler(request, handlePatchGroup, { group: 'A' });

        expect(response.status).toBe(422);
        expect(updateGroup).toHaveBeenCalledWith(
            expect.objectContaining({ group: 'A', targetGroup: 'A' }),
            transactionSession
        );
        expect(renameGroup).not.toHaveBeenCalled();
        expect(renameVariantsGroup).not.toHaveBeenCalled();
        expect(renameProductsGroup).not.toHaveBeenCalled();
    });

    it('reads groups after checking the session', async () => {
        const groups = [{ group: 'A', order: 0 }];
        vi.mocked(getGroups).mockResolvedValueOnce(groups);

        await expect(getGroupsAction()).resolves.toStrictEqual(groups);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('updates a group and reports a rejected change', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await updateGroupAction({ group: 'A', annual: false, review: true, image: 'image' });

        expect(updateGroup).toHaveBeenCalledWith(
            { group: 'A', annual: false, review: true, image: 'image' },
            transactionSession
        );
        await expect(updateGroupAction({ group: 'A' })).rejects.toThrow('The requested change could not be applied');
    });

    it('preserves existing group settings in the update transaction', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', annual: false, review: true, image: 'old' });
        vi.mocked(updateGroup).mockResolvedValueOnce(true);

        await updateGroupAction({ group: ' A ', review: false });

        expect(getGroup).not.toHaveBeenCalled();
        expect(updateGroup).toHaveBeenCalledWith({ group: 'A', review: false }, transactionSession);
    });

    it('leaves new-group defaults to the data layer', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(true);

        await updateGroupAction({ group: 'A' });

        expect(updateGroup).toHaveBeenCalledWith({ group: 'A' }, transactionSession);
    });

    it('rejects unauthenticated updates before entering the transaction', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error(SchemaError.Unauthorized));

        await expect(updateGroupAction({ group: 'A' })).rejects.toThrow(SchemaError.Unauthorized);

        expect(withinTransaction).not.toHaveBeenCalled();
        expect(getGroup).not.toHaveBeenCalled();
        expect(updateGroup).not.toHaveBeenCalled();
    });

    it('renames a group using its existing values for omitted fields', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce({ group: 'A', order: 0, annual: true, review: false, image: 'old' });
        vi.mocked(renameGroup).mockResolvedValueOnce(true);
        await renameGroupAction({ group: 'A', targetGroup: 'B', review: true });

        expect(renameGroup).toHaveBeenCalledWith({ group: 'A', targetGroup: 'B', review: true }, transactionSession);
        expect(getGroup).not.toHaveBeenCalled();
        expect(getGroups).not.toHaveBeenCalled();
        expect(renameVariantsGroup).toHaveBeenCalledWith('A', 'B', transactionSession);
        expect(renameProductsGroup).toHaveBeenCalledWith('A', 'B', transactionSession);
    });

    it('reports a missing group or failed rename', async () => {
        vi.mocked(getGroup).mockResolvedValueOnce(null).mockResolvedValueOnce({ group: 'A', order: 0 });
        vi.mocked(renameGroup).mockRejectedValueOnce(new Error(SchemaError.NotFound)).mockResolvedValueOnce(false);

        await expect(renameGroupAction({ group: 'A', targetGroup: 'B' })).rejects.toThrow(SchemaError.NotFound);
        await expect(renameGroupAction({ group: 'A', targetGroup: 'B' })).rejects.toThrow(
            'The requested change could not be applied'
        );
    });

    it('deletes and reorders groups, reporting unsuccessful writes', async () => {
        vi.mocked(deleteGroup).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        vi.mocked(reorderGroups).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await deleteGroupAction({ group: 'A' });

        await expect(deleteGroupAction({ group: 'A' })).rejects.toThrow('The requested change could not be applied');

        await reorderGroupsAction({ groups: { A: 1 } });

        await expect(reorderGroupsAction({ groups: { A: 1 } })).rejects.toThrow(
            'The requested change could not be applied'
        );
    });
});
