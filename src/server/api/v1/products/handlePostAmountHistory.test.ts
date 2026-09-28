import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostAmountHistory } from '~/server/api/v1/products/handlePostAmountHistory';
import { moveConsumedToRecycled } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ moveConsumedToRecycled: vi.fn() }));

async function move(body: unknown, year = '26') {
    const request = new NextRequest('http://localhost/api/v1/amount-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePostAmountHistory, { group: 'Uogienės', name: 'Avietės', year });
}

describe('handlePostAmountHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(moveConsumedToRecycled).mockResolvedValue(true);
    });

    it('requires a valid year, variant and positive amount', async () => {
        expect((await move({ variant: 'Stiklainis', amount: 1 }, 'bad')).status).toBe(400);
        expect((await move({ variant: 'Stiklainis', amount: 0 })).status).toBe(400);
        expect((await move({ amount: 1 })).status).toBe(400);
        expect(moveConsumedToRecycled).not.toHaveBeenCalled();
    });

    it('moves consumed stock with its metadata', async () => {
        const response = await move({
            variant: 'Stiklainis',
            amount: 2,
            suspicious: true,
            home: false,
            expiresAt: 123456,
            user: 'tester',
        });

        expect(response.status).toBe(204);
        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Uogienės',
            'Avietės',
            26,
            'Stiklainis',
            2,
            { suspicious: true, home: false, expiresAt: 123456 },
            'tester'
        );
    });

    it('reports an operation that could not be applied', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(false);

        expect((await move({ variant: 'Stiklainis', amount: 1 })).status).toBe(422);
    });
});
