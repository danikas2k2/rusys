import { ClientSession } from 'mongodb';

import { ZodError } from '~/schema';
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

        await expect(getSummaryHistory({ group: 'A', name: 'B', year: 2026 })).resolves.toStrictEqual({
            updates: [],
            undates: [],
        });

        expect(getSummaryHistoryData).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            expect.any(ClientSession)
        );
    });

    it.each([
        ['group', () => getSummaryHistory({ group: {} as never, name: 'B', year: 2026 })],
        ['name', () => getSummaryHistory({ group: 'A', name: {} as never, year: 2026 })],
        ['year', () => getSummaryHistory({ group: 'A', name: 'B', year: Number.NaN })],
        ['request', () => getSummaryHistory(null as never)],
        ['extra fields', () => getSummaryHistory({ group: 'A', name: 'B', year: 0, extra: true } as never)],
    ] as const)('rejects invalid %s before reading data', async (_label, call) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(getSummaryHistoryData).not.toHaveBeenCalled();
    });

    it('uses normalized identities from the schema', async () => {
        await getSummaryHistory({ group: ' A ', name: ' B ', year: 0 });

        expect(getSummaryHistoryData).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 0 },
            expect.any(ClientSession)
        );
    });

    it('checks the session before validating or reading history', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(getSummaryHistory(null as never)).rejects.toThrow('Unauthorized');
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

vi.mock(import('~/server/db'));
