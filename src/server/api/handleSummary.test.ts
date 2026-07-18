/** @jest-environment node */
import { getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSummary } from '~/server/api/handleSummary';
import { getFullSummary } from '~/server/data/summary';
import type { ApiSummary } from '~/types/api';
import type { Summary } from '~/types/data';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/summary');

describe('handleSummary', () => {
    const request = mockRequest();
    const response = mockResponse<ApiSummary>();
    const summary: Summary[] = [
        { group: 'Šaldytos', name: 'Braškės', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
        { group: 'Šaldytos', name: 'Mėlynės', years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }] },
        { group: 'Uogienės', name: 'Braškės', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
    ];
    const years = getYearsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(getFullSummary).mockResolvedValueOnce({ years, groups, variants, summary });

        await handleSummary(request, response);

        expect(getFullSummary).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, groups, variants, summary });
    });

    it('returns error response on error', async () => {
        jest.mocked(getFullSummary).mockRejectedValueOnce('Failed to get summary');

        await handleSummary(request, response);

        expect(getFullSummary).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get summary' });
    });
});
