/** @jest-environment node */
import { type ApiUpdateDetailsYears, type ApiDetails } from '~/common/api';
import { handleUpdateDetailsYears } from '~/server/app/handleUpdateDetailsYears';
import { getYearsAndDetails, updateDetailsYears } from '~/server/data/details';
import { getDetailsFixture, getYearsFixture } from '~/tests/fixtures';
import { type RemovingYearAmounts } from '~/common/types';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleUpdateDetailsYears', () => {
    const update: RemovingYearAmounts[] = [
        { year: 21, amounts: [{ variant: 'p', amount: 2 }] },
        { year: 22, amounts: [{ variant: 'd', amount: 1 }] },
    ];
    const request = mockRequest<ApiUpdateDetailsYears>({
        group: 'G',
        name: 'A',
        years: update,
        withoutHistory: false,
    });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (updateDetailsYears as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleUpdateDetailsYears(request, response);

        expect(updateDetailsYears).toHaveBeenCalledWith('G', 'A', update, false);
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (updateDetailsYears as jest.Mock).mockResolvedValueOnce(false);

        await handleUpdateDetailsYears(request, response);

        expect(updateDetailsYears).toHaveBeenCalledWith('G', 'A', update, false);
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (updateDetailsYears as jest.Mock).mockRejectedValueOnce('Failed to set details');

        await handleUpdateDetailsYears(request, response);

        expect(updateDetailsYears).toHaveBeenCalledWith('G', 'A', update, false);
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set details' });
    });
});
