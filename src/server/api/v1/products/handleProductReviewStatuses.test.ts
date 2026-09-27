import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleProductReviewStatuses } from '~/server/api/v1/products/handleProductReviewStatuses';
import { setMissingBulk } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ setMissingBulk: vi.fn() }));

async function update(body: unknown) {
    const request = new NextRequest('http://localhost/api/v1/products/review-statuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handleProductReviewStatuses);
}

describe('handleProductReviewStatuses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(setMissingBulk).mockResolvedValue(true);
    });

    it('rejects empty or incomplete review updates', async () => {
        expect((await update({ updates: [] })).status).toBe(400);
        expect((await update({ updates: [{ group: 'Uogienės', name: 'Avietės' }] })).status).toBe(400);
        expect(setMissingBulk).not.toHaveBeenCalled();
    });

    it('applies multiple product statuses in one operation', async () => {
        const updates = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Daržovės', name: 'Agurkai', missing: false },
        ];

        expect((await update({ updates })).status).toBe(204);
        expect(setMissingBulk).toHaveBeenCalledWith(updates);
    });

    it('reports a rejected bulk update', async () => {
        vi.mocked(setMissingBulk).mockResolvedValueOnce(false);

        expect((await update({ updates: [{ group: 'Uogienės', name: 'Avietės', missing: true }] })).status).toBe(422);
    });
});
