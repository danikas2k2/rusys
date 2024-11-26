/** @jest-environment node */
import { type ApiSummary } from '~/common/api';
import { type Summary } from '~/common/types';
import { handleSummary } from '~/server/app/handleSummary';
import { getFullSummary } from '~/server/data/updates';
import { getGroupsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/updates');

describe('handleSummary', () => {
    const request = mockRequest();
    const response = mockResponse<ApiSummary>();
    const summary: Summary[] = [
        { group: 'J', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
        { group: 'J', name: 'B', years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }] },
        { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
    ];
    const years = getYearsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (getFullSummary as jest.Mock).mockResolvedValueOnce({ years, groups, variants, summary });

        await handleSummary(request, response);

        expect(getFullSummary).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, groups, variants, summary });
    });

    it('returns empty response on failure', async () => {
        (getFullSummary as jest.Mock).mockResolvedValueOnce(undefined);

        await handleSummary(request, response);

        expect(getFullSummary).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (getFullSummary as jest.Mock).mockRejectedValueOnce('Failed to get summary');

        await handleSummary(request, response);

        expect(getFullSummary).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get summary' });
    });
});
