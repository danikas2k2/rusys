import { ClientSession } from 'mongodb';

import { getProductHistoryData, getSummaryHistoryData } from '~/server/data/actionHistory';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { withinTransaction } from '~/server/db';

vi.mock(import('~/server/db'));

vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/summary'));

describe('action history data', () => {
    afterEach(() => vi.clearAllMocks());

    it('finishes each read before using the same session for the next read', async () => {
        let updatesFinished = false;
        vi.mocked(getProductUpdates).mockImplementationOnce(async () => {
            await Promise.resolve();
            updatesFinished = true;
            return [];
        });
        vi.mocked(getProductUndates).mockImplementationOnce(async () => {
            expect(updatesFinished).toBe(true);

            return [];
        });
        const request = { group: 'A', name: 'B', year: 2026 };

        await withinTransaction(async (session) => {
            const result = await getProductHistoryData(request, session);

            expect(getProductUpdates).toHaveBeenCalledWith(request, session);
            expect(getProductUndates).toHaveBeenCalledWith(request, session);

            return result;
        });
    });

    it('loads product updates and removals for the requested item', async () => {
        vi.mocked(getProductUpdates).mockResolvedValueOnce([]);
        vi.mocked(getProductUndates).mockResolvedValueOnce([]);

        await expect(
            withinTransaction((session) => getProductHistoryData({ group: 'A', name: 'B', year: 2026 }, session))
        ).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getProductUpdates).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            expect.any(ClientSession)
        );
        expect(getProductUndates).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            expect.any(ClientSession)
        );
    });

    it('loads summary updates and removals for the requested item', async () => {
        vi.mocked(getSummaryUpdates).mockResolvedValueOnce([]);
        vi.mocked(getSummaryUndates).mockResolvedValueOnce([]);

        await expect(
            withinTransaction((session) => getSummaryHistoryData({ group: 'A', name: 'B', year: 2026 }, session))
        ).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getSummaryUpdates).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            expect.any(ClientSession)
        );
        expect(getSummaryUndates).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            expect.any(ClientSession)
        );
    });
});
