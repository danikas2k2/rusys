import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutGroup } from '~/server/api/v1/groups/handlePutGroup';
import { updateGroup } from '~/server/data/groups';

vi.mock(import('~/server/data/groups'), () => ({ updateGroup: vi.fn() }));

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
        vi.mocked(updateGroup).mockResolvedValue(true);
    });

    it('requires a group and validates category options', async () => {
        expect((await put({}, '')).status).toBe(400);
        expect((await put({ annual: 'yes' })).status).toBe(400);
        expect((await put({ image: 17 })).status).toBe(400);
        expect(updateGroup).not.toHaveBeenCalled();
    });

    it('uses defaults for omitted options and passes supplied values', async () => {
        expect((await put({})).status).toBe(204);
        expect(updateGroup).toHaveBeenLastCalledWith('Uogienės', true, false, undefined);
        expect((await put({ annual: false, review: true, image: '/images/icon.png' })).status).toBe(204);
        expect(updateGroup).toHaveBeenLastCalledWith('Uogienės', false, true, '/images/icon.png');
    });

    it('reports a rejected update', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(false);

        expect((await put({})).status).toBe(422);
    });
});
