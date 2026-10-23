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

    it.each([
        [getProductHistoryData, getProductUpdates, getProductUndates],
        [getSummaryHistoryData, getSummaryUpdates, getSummaryUndates],
    ])(
        'starts history reads in parallel with the same transaction session (%#)',
        async (getHistory, getUpdates, getUndates) => {
            const updates = Promise.withResolvers<Awaited<ReturnType<typeof getUpdates>>>();
            const undates = Promise.withResolvers<Awaited<ReturnType<typeof getUndates>>>();
            vi.mocked(getUpdates).mockReturnValueOnce(updates.promise);
            vi.mocked(getUndates).mockReturnValueOnce(undates.promise);
            const request = { group: 'A', name: 'B', year: 2026 };

            await withinTransaction(async (session) => {
                const result = getHistory(request, session);

                // Both reads must start before either response is available.
                expect(getUpdates).toHaveBeenCalledExactlyOnceWith(request, session);
                expect(getUndates).toHaveBeenCalledExactlyOnceWith(request, session);

                const updateData = [{ group: 'A', name: 'B', time: 1 }];
                const undateData = [{ group: 'A', name: 'B', time: 2 }];
                updates.resolve(updateData);
                undates.resolve(undateData);

                await expect(result).resolves.toStrictEqual({ updates: updateData, undates: undateData });
            });
        }
    );

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
