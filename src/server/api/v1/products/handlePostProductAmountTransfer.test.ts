import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostProductAmountTransfer } from '~/server/api/v1/products/handlePostProductAmountTransfer';
import { transferAmounts } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ transferAmounts: vi.fn() }));

const params = { group: 'Uogienės', name: 'Avietės', year: '26' };
const body = {
    targetGroup: 'Daržovės',
    targetName: 'Morkos',
    amounts: [{ variant: 'Stiklainis', amount: 2 }],
    user: 'tester',
    comment: 'Perkelta',
};

async function transfer(payload: unknown, routeParams = params) {
    const request = new NextRequest('http://localhost/api/v1/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return runApiHandler(request, handlePostProductAmountTransfer, routeParams);
}

describe('handlePostProductAmountTransfer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(transferAmounts).mockResolvedValue(true);
    });

    it('rejects an invalid year or a transfer without amounts', async () => {
        expect((await transfer(body, { ...params, year: 'invalid' })).status).toBe(400);
        expect((await transfer({ ...body, amounts: [] })).status).toBe(400);
        expect(transferAmounts).not.toHaveBeenCalled();
    });

    it('passes the complete transfer to the data layer', async () => {
        const response = await transfer(body);

        expect(response.status).toBe(204);
        expect(transferAmounts).toHaveBeenCalledWith(
            'Uogienės',
            'Avietės',
            26,
            'Daržovės',
            'Morkos',
            body.amounts,
            'tester',
            'Perkelta'
        );
    });

    it('reports a transfer rejected by the data layer', async () => {
        vi.mocked(transferAmounts).mockResolvedValueOnce(false);

        expect((await transfer(body)).status).toBe(422);
    });
});
