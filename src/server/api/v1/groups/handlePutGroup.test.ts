import { NextRequest } from 'next/server';

import { SchemaError } from '~/schema';
import { updateGroupAction } from '~/server/actions/groups';
import { runApiHandler } from '~/server/api/next';
import { handlePutGroup } from '~/server/api/v1/groups/handlePutGroup';
import { requireSession } from '~/server/auth/session';

vi.mock(import('~/server/actions/groups'), () => ({ updateGroupAction: vi.fn() }));
vi.mock(import('~/server/auth/session'), () => ({ requireSession: vi.fn() }));

async function put(body: unknown, group = 'Uogienės') {
    const request = new NextRequest('http://localhost/api/v1/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePutGroup, { group });
}

describe('handlePutGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(updateGroupAction).mockResolvedValue();
    });

    it('requires a group and validates category options', async () => {
        expect((await put({}, '')).status).toBe(400);
        expect((await put({ annual: 'yes' })).status).toBe(400);
        expect((await put({ image: 17 })).status).toBe(400);
        expect((await put({ review: 'yes' })).status).toBe(400);
        expect(updateGroupAction).not.toHaveBeenCalled();
    });

    it.each([null, [], 'invalid', { annual: null }, { review: null }, { image: null }])(
        'rejects malformed body %j without invoking the action',
        async (body) => {
            const response = await put(body);

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
                error: { code: 'VALIDATION_ERROR', message: SchemaError.InvalidRequest },
            });
            expect(updateGroupAction).not.toHaveBeenCalled();
        }
    );

    it('reports an invalid path without invoking the action', async () => {
        const response = await put({}, '');

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toStrictEqual({
            error: { code: 'VALIDATION_ERROR', message: SchemaError.InvalidRequest },
        });
        expect(updateGroupAction).not.toHaveBeenCalled();
    });

    it('preserves omitted options for the action and passes supplied values', async () => {
        expect((await put({})).status).toBe(204);
        expect(updateGroupAction).toHaveBeenLastCalledWith({
            group: 'Uogienės',
            annual: undefined,
            review: undefined,
            image: undefined,
        });
        expect((await put({ annual: false, review: true, image: '/images/icon.png' })).status).toBe(204);
        expect(updateGroupAction).toHaveBeenLastCalledWith({
            group: 'Uogienės',
            annual: false,
            review: true,
            image: '/images/icon.png',
        });
        expect((await put({ annual: false, review: false, image: '' })).status).toBe(204);
        expect(updateGroupAction).toHaveBeenLastCalledWith({
            group: 'Uogienės',
            annual: false,
            review: false,
            image: '',
        });
    });

    it('keeps the route identity authoritative and trims names', async () => {
        const response = await put({ group: 'Other', image: '' }, ' Uogienės ');

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

        const response = await put({});

        expect(response.status).toBe(status);
        await expect(response.json()).resolves.toStrictEqual({ error: { code, message: output } });
    });

    it('does not expose non-Error rejections', async () => {
        vi.mocked(updateGroupAction).mockRejectedValueOnce('database credentials');

        const response = await put({});

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toStrictEqual({
            error: { code: 'INTERNAL_ERROR', message: SchemaError.RequestFailed },
        });
    });

    it('does not invoke the action for an unauthenticated request', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error(SchemaError.Unauthorized));

        expect((await put({})).status).toBe(401);
        expect(updateGroupAction).not.toHaveBeenCalled();
    });
});
