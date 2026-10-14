import { getProductHistoryData, getSummaryHistoryData } from '~/server/data/actionHistory';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/summary'));

describe('action history data', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads product updates and removals for the requested item', async () => {
        vi.mocked(getProductUpdates).mockResolvedValueOnce([]);
        vi.mocked(getProductUndates).mockResolvedValueOnce([]);

        await expect(getProductHistoryData('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getProductUpdates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
        expect(getProductUndates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
    });

    it('loads summary updates and removals for the requested item', async () => {
        vi.mocked(getSummaryUpdates).mockResolvedValueOnce([]);
        vi.mocked(getSummaryUndates).mockResolvedValueOnce([]);

        await expect(getSummaryHistoryData('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getSummaryUpdates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
        expect(getSummaryUndates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
    });
});
