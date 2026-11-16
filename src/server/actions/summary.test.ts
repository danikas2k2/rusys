import { ClientSession } from 'mongodb';

import { ZodError } from '~/schema';
import {
    getSummaryHistory,
    readProductConsumptionYears,
    readProductSummary,
    readSummary,
} from '~/server/actions/summary';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary, getProductConsumptionYears, getProductSummaryAmounts } from '~/server/data/summary';

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

describe('readProductSummary', () => {
    afterEach(() => vi.clearAllMocks());

    it('validates identity and loads the requested product consumption period after authorization', async () => {
        const amounts = [{ variant: 'jar', amount: 2, recycled: false }];
        vi.mocked(getProductSummaryAmounts).mockResolvedValueOnce(amounts);

        await expect(readProductSummary({ group: ' A ', name: ' B ', year: 18 })).resolves.toBe(amounts);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(getProductSummaryAmounts).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 18 },
            expect.any(ClientSession)
        );
    });

    it('rejects invalid input before reading totals', async () => {
        await expect(readProductSummary({ group: 'A', name: 'B', year: NaN })).rejects.toBeInstanceOf(ZodError);
        expect(getProductSummaryAmounts).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated reads before validation', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(readProductSummary(null as never)).rejects.toThrow('Unauthorized');
        expect(getProductSummaryAmounts).not.toHaveBeenCalled();
    });
});

describe('readProductConsumptionYears', () => {
    afterEach(() => vi.clearAllMocks());

    it('normalizes the exact product identity after checking authorization', async () => {
        vi.mocked(getProductConsumptionYears).mockResolvedValueOnce([25, 24]);

        await expect(readProductConsumptionYears({ group: ' A ', name: ' B ' })).resolves.toStrictEqual([25, 24]);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(getProductConsumptionYears).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B' },
            expect.any(ClientSession)
        );
    });

    it('rejects malformed identities before reading data', async () => {
        await expect(readProductConsumptionYears({ group: 'A', name: {} as never })).rejects.toBeInstanceOf(ZodError);
        expect(getProductConsumptionYears).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated requests', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(readProductConsumptionYears(null as never)).rejects.toThrow('Unauthorized');
        expect(getProductConsumptionYears).not.toHaveBeenCalled();
    });
});
