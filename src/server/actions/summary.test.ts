import { getSummaryHistory, readSummary } from '~/server/actions/summary';
import { requireSession } from '~/server/auth/session';
import { getFullSummary, getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getVisualScenario, getVisualSummaryHistory } from '~/tests/fixtures/visualData';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/summary'));
vi.mock(import('~/tests/fixtures/visualData'), () => ({
    getVisualScenario: vi.fn(),
    getVisualSummaryHistory: vi.fn(),
}));

describe('getSummaryHistory', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('loads summary history directly from server data functions', async () => {
        vi.mocked(getSummaryUpdates).mockResolvedValue([]);
        vi.mocked(getSummaryUndates).mockResolvedValue([]);

        await expect(getSummaryHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });

        expect(getSummaryUpdates).toHaveBeenCalledWith('A', 'B', 2026);
        expect(getSummaryUndates).toHaveBeenCalledWith('A', 'B', 2026);
    });

    it('loads fixture history for a visual scenario without reading the database', async () => {
        vi.stubEnv('PLAYWRIGHT_TEST', '1');
        const history = { updates: [], undates: [] };
        vi.mocked(getVisualScenario).mockResolvedValueOnce('history');
        vi.mocked(getVisualSummaryHistory).mockReturnValueOnce(history);

        await expect(getSummaryHistory('Uogienės', 'Avietės', 2026)).resolves.toBe(history);

        expect(getVisualSummaryHistory).toHaveBeenCalledExactlyOnceWith('Uogienės', 'Avietės', 2026);
        expect(getSummaryUpdates).not.toHaveBeenCalled();
        expect(getSummaryUndates).not.toHaveBeenCalled();
    });

    it('reads database history when visual mode has no scenario', async () => {
        vi.stubEnv('PLAYWRIGHT_TEST', '1');
        vi.mocked(getVisualScenario).mockResolvedValueOnce(undefined);
        vi.mocked(getSummaryUpdates).mockResolvedValueOnce([]);
        vi.mocked(getSummaryUndates).mockResolvedValueOnce([]);

        await expect(getSummaryHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });

        expect(getVisualSummaryHistory).not.toHaveBeenCalled();
        expect(getSummaryUpdates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
        expect(getSummaryUndates).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
    });

    it.each([
        ['group', () => getSummaryHistory({} as never, 'B', 2026)],
        ['name', () => getSummaryHistory('A', {} as never, 2026)],
        ['year', () => getSummaryHistory('A', 'B', Number.NaN)],
    ] as const)('rejects invalid %s before reading data', async (_label, call) => {
        await expect(call()).rejects.toThrow('Invalid history selection');

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(getSummaryUpdates).not.toHaveBeenCalled();
        expect(getSummaryUndates).not.toHaveBeenCalled();
    });
});

describe('readSummary', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns full summary after checking the session', async () => {
        const summary = { groups: [], summary: [], years: [] };
        vi.mocked(getFullSummary).mockResolvedValueOnce(summary);

        await expect(readSummary()).resolves.toBe(summary);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not read data without a session', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(readSummary()).rejects.toThrow('Unauthorized');
        expect(getFullSummary).not.toHaveBeenCalled();
    });
});
