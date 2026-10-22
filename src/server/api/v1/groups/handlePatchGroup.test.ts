import { NextRequest } from 'next/server';

import { SchemaError } from '~/schema';
import { renameGroupAction, updateGroupAction } from '~/server/actions/groups';
import { runApiHandler } from '~/server/api/next';
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';

vi.mock(import('~/server/actions/groups'), () => ({ renameGroupAction: vi.fn(), updateGroupAction: vi.fn() }));
vi.mock(import('~/server/auth/session'), () => ({ requireSession: vi.fn() }));

async function patch(body: unknown, group = 'Uogienės') {
    const request = new NextRequest('http://localhost/api/v1/groups/Uogienės', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePatchGroup, { group });
}

describe('handlePatchGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(updateGroupAction).mockResolvedValue();
        vi.mocked(renameGroupAction).mockResolvedValue();
    });

    it('rejects invalid path or body transport shape without invoking actions', async () => {
        expect((await patch({ review: true }, '')).status).toBe(400);
        expect((await patch(null)).status).toBe(400);
        expect((await patch([])).status).toBe(400);
        expect((await patch('invalid')).status).toBe(400);
        expect(updateGroupAction).not.toHaveBeenCalled();
        expect(renameGroupAction).not.toHaveBeenCalled();
    });

    it('delegates updates with omitted values left to the action', async () => {
        const response = await patch({ review: true });

        expect(response.status).toBe(204);
        expect(updateGroupAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            annual: undefined,
            review: true,
            image: undefined,
        });
        expect(renameGroupAction).not.toHaveBeenCalled();
    });

    it('renames a category with its updated options', async () => {
        const response = await patch({ targetGroup: 'Uogų uogienės', annual: false, image: 'new.png' });

        expect(response.status).toBe(204);
        expect(renameGroupAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            targetGroup: 'Uogų uogienės',
            annual: false,
            review: undefined,
            image: 'new.png',
        });
        expect(updateGroupAction).not.toHaveBeenCalled();
    });

    it('delegates an unchanged name to the rename action to decide whether settings changed', async () => {
        expect((await patch({ targetGroup: 'Uogienės', image: '' })).status).toBe(204);
        expect(renameGroupAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            targetGroup: 'Uogienės',
            annual: undefined,
            review: undefined,
            image: '',
        });
        expect(updateGroupAction).not.toHaveBeenCalled();
    });

    it.each([null, 42, {}, ''])('rejects malformed name %s before invoking actions', async (name) => {
        expect((await patch({ targetGroup: name })).status).toBe(400);
        expect(renameGroupAction).not.toHaveBeenCalled();
        expect(updateGroupAction).not.toHaveBeenCalled();
    });

    it('keeps the route identity authoritative and trims names', async () => {
        const response = await patch({ group: 'Other', image: '' }, ' Uogienės ');

        expect(response.status).toBe(204);
        expect(updateGroupAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            annual: undefined,
            review: undefined,
            image: '',
        });
    });

    it.each([
        [SchemaError.InvalidRequest, 400, 'VALIDATION_ERROR', SchemaError.InvalidRequest],
        [SchemaError.CategoryAlreadyExists, 400, 'VALIDATION_ERROR', SchemaError.CategoryAlreadyExists],
        [SchemaError.NotFound, 404, 'NOT_FOUND', SchemaError.GroupNotFound],
        [SchemaError.RequestFailed, 422, 'OPERATION_REJECTED', SchemaError.RequestFailed],
        [SchemaError.Unauthorized, 401, 'UNAUTHORIZED', SchemaError.Unauthorized],
        ['database credentials', 500, 'INTERNAL_ERROR', SchemaError.RequestFailed],
    ])('maps action failure %s to status %s without exposing unknown text', async (message, status, code, output) => {
        vi.mocked(updateGroupAction).mockRejectedValueOnce(new Error(message));

        const response = await patch({ review: true });

        expect(response.status).toBe(status);
        await expect(response.json()).resolves.toStrictEqual({ error: { code, message: output } });
    });
});
