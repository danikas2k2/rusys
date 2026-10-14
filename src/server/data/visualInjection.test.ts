import { getVisualAppData, getVisualHistory, getVisualScenario } from '~/tests/fixtures/visualData';
import { getProductHistoryData, getSummaryHistoryData } from '~/tests/fixtures/visualHistory';
import { getInitialAppData } from '~/tests/fixtures/visualInitialAppData';

vi.mock(import('~/tests/fixtures/visualData'), () => ({
    getVisualAppData: vi.fn(),
    getVisualHistory: vi.fn(),
    getVisualScenario: vi.fn(),
}));

describe('visual data injection', () => {
    afterEach(() => vi.clearAllMocks());

    it('supplies initial page data from the selected scenario', async () => {
        const result = { data: { groups: [] }, resource: 'groups' as const };
        vi.mocked(getVisualScenario).mockResolvedValueOnce('basic');
        vi.mocked(getVisualAppData).mockReturnValueOnce(result);

        await expect(getInitialAppData('/categories')).resolves.toBe(result);
        expect(getVisualAppData).toHaveBeenCalledExactlyOnceWith('/categories', 'basic');
    });

    it.each([getProductHistoryData, getSummaryHistoryData])(
        'supplies selected history from the scenario',
        async (read) => {
            const history = { updates: [], undates: [] };
            vi.mocked(getVisualScenario).mockResolvedValueOnce('history');
            vi.mocked(getVisualHistory).mockReturnValueOnce(history);

            await expect(read('Uogienės', 'Avietės', 2026)).resolves.toBe(history);
            expect(getVisualHistory).toHaveBeenCalledExactlyOnceWith('Uogienės', 'Avietės', 2026);
        }
    );

    it('rejects missing scenarios before supplying page data', async () => {
        vi.mocked(getVisualScenario).mockRejectedValueOnce(new Error('Missing scenario'));

        await expect(getInitialAppData('/categories')).rejects.toThrow('Missing scenario');
        expect(getVisualAppData).not.toHaveBeenCalled();
    });

    it('rejects missing scenarios before supplying history', async () => {
        vi.mocked(getVisualScenario).mockRejectedValueOnce(new Error('Missing scenario'));

        await expect(getProductHistoryData('A', 'B', 2026)).rejects.toThrow('Missing scenario');
        expect(getVisualHistory).not.toHaveBeenCalled();
    });
});
