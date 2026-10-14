import { getSummaryHistory, readSummary } from '~/server/actions/summary';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary } from '~/server/data/summary';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/actionHistory'));
vi.mock(import('~/server/data/summary'));

describe('getSummaryHistory', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('loads summary history through the data boundary', async () => {
        vi.mocked(getSummaryHistoryData).mockResolvedValue({ updates: [], undates: [] });

        await expect(getSummaryHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });

        expect(getSummaryHistoryData).toHaveBeenCalledExactlyOnceWith('A', 'B', 2026);
    });

    it.each([
        ['group', () => getSummaryHistory({} as never, 'B', 2026)],
        ['name', () => getSummaryHistory('A', {} as never, 2026)],
        ['year', () => getSummaryHistory('A', 'B', Number.NaN)],
    ] as const)('rejects invalid %s before reading data', async (_label, call) => {
        await expect(call()).rejects.toThrow('Invalid history selection');

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(getSummaryHistoryData).not.toHaveBeenCalled();
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
