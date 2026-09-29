import { getProductHistory, getSummaryHistory } from '~/server/actions/history';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/summary'));

describe('history actions', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads product and summary history directly from server data functions', async () => {
        vi.mocked(getProductUpdates).mockResolvedValue([]);
        vi.mocked(getProductUndates).mockResolvedValue([]);
        vi.mocked(getSummaryUpdates).mockResolvedValue([]);
        vi.mocked(getSummaryUndates).mockResolvedValue([]);

        await expect(getProductHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });
        await expect(getSummaryHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });

        expect(getProductUpdates).toHaveBeenCalledWith('A', 'B', 2026);
        expect(getProductUndates).toHaveBeenCalledWith('A', 'B', 2026);
        expect(getSummaryUpdates).toHaveBeenCalledWith('A', 'B', 2026);
        expect(getSummaryUndates).toHaveBeenCalledWith('A', 'B', 2026);
    });

    it('rejects invalid selections before reading the database', async () => {
        await expect(getProductHistory('', 'B', 2026)).rejects.toThrow('Invalid history selection');
        await expect(getSummaryHistory('A', 'B', Number.NaN)).rejects.toThrow('Invalid history selection');

        expect(getProductUpdates).not.toHaveBeenCalled();
        expect(getSummaryUpdates).not.toHaveBeenCalled();
    });
});
