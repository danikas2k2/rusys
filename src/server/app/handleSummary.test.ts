/** @jest-environment node */
import { type ApiSummary } from '~/common/api';
import { handleSummary } from '~/server/app/handleSummary';
import { getTestYears } from '~/tests/fixtures';
import { type Summary } from '~/common/types';
import { getSummary } from '~/server/data/updates';
import { getYears } from '~/server/data/years';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/updates');
jest.mock('~/server/data/years');

describe('handleSummary', () => {
    const request = mockRequest();
    const response = mockResponse<ApiSummary>();
    const summary: Summary[] = [
        { group: 'J', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
        { group: 'J', name: 'B', years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }] },
        { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
    ];
    const years = getTestYears();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (getSummary as jest.Mock).mockResolvedValueOnce(summary);

        await handleSummary(request, response);

        expect(getYears).toHaveReturnedWith(years);
        expect(getSummary).toHaveBeenCalledWith(years);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, summary });
    });

    it('returns empty response on failure', async () => {
        (getSummary as jest.Mock).mockResolvedValueOnce(undefined);

        await handleSummary(request, response);

        expect(getYears).toHaveReturnedWith(years);
        expect(getSummary).toHaveBeenCalledWith(years);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (getSummary as jest.Mock).mockRejectedValueOnce('Failed to get summary');

        await handleSummary(request, response);

        expect(getYears).toHaveReturnedWith(years);
        expect(getSummary).toHaveBeenCalledWith(years);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get summary' });
    });
});
