import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleSetProductYear } from '~/server/api/v1/products/handleSetProductYear';
import { setRemoving } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ setRemoving: vi.fn() }));

async function put(body: unknown, year = '26') {
    const request = new NextRequest('http://localhost/api/v1/years', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handleSetProductYear, { group: 'Uogienės', name: 'Avietės', year });
}

describe('handleSetProductYear', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(setRemoving).mockResolvedValue(true);
    });

    it('requires a valid year and a boolean removing flag', async () => {
        expect((await put({ removing: true }, 'bad')).status).toBe(400);
        expect((await put({ removing: 'yes' })).status).toBe(400);
        expect(setRemoving).not.toHaveBeenCalled();
    });

    it('sets and clears the year removal marker', async () => {
        expect((await put({ removing: true })).status).toBe(204);
        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Avietės', 26, true);

        expect((await put({ removing: false })).status).toBe(204);
        expect(setRemoving).toHaveBeenLastCalledWith('Uogienės', 'Avietės', 26, false);
    });

    it('reports a rejected year update', async () => {
        vi.mocked(setRemoving).mockResolvedValueOnce(false);

        expect((await put({ removing: true })).status).toBe(422);
    });
});
