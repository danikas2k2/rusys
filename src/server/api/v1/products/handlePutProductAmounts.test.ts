import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutProductAmounts } from '~/server/api/v1/products/handlePutProductAmounts';
import { setAmounts } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ setAmounts: vi.fn() }));

async function put(body: unknown, year = '26') {
    const request = new NextRequest('http://localhost/api/v1/amounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePutProductAmounts, { group: 'Uogienės', name: 'Avietės', year });
}

describe('handlePutProductAmounts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(setAmounts).mockResolvedValue(true);
    });

    it('requires a valid year and nonempty amounts', async () => {
        expect((await put({ amounts: [{ variant: 'Stiklainis', amount: 1 }] }, 'bad')).status).toBe(400);
        expect((await put({ amounts: [] })).status).toBe(400);
        expect(setAmounts).not.toHaveBeenCalled();
    });

    it('updates the selected year with user and comment', async () => {
        const amounts = [{ variant: 'Stiklainis', amount: 4 }];
        const response = await put({ amounts, user: 'tester', comment: 'Papildyta' });

        expect(response.status).toBe(204);
        expect(setAmounts).toHaveBeenCalledWith('Uogienės', 'Avietės', 26, amounts, 'tester', 'Papildyta');
    });

    it('returns a rejected-operation error', async () => {
        vi.mocked(setAmounts).mockResolvedValueOnce(false);

        expect((await put({ amounts: [{ variant: 'Stiklainis', amount: 4 }] })).status).toBe(422);
    });
});
