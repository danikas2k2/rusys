/** @jest-environment node */
import { type ApiDetails, type ApiUpdateDetailsAmounts } from '~/common/api';
import { handleUpdateDetailsVariants } from '~/server/app/handleUpdateDetailsVariants';
import { getYearsAndDetails, updateDetailsAmounts } from '~/server/data/details';
import { getTestDetails, getTestYears } from '~/tests/fixtures';
import { type VariantAmount } from '~/common/types';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/years');

describe('handleUpdateDetailsVariants', () => {
    const amounts: VariantAmount[] = [{ variant: 'd', amount: 2 }];
    const request = mockRequest<ApiUpdateDetailsAmounts>({
        group: 'G',
        name: 'A',
        year: 21,
        amounts,
        withoutHistory: false,
    });
    const response = mockResponse<ApiDetails>();
    const years = getTestYears();
    const details = getTestDetails();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (updateDetailsAmounts as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleUpdateDetailsVariants(request, response);

        expect(updateDetailsAmounts).toHaveBeenCalledWith('G', 'A', 21, amounts, false);
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (updateDetailsAmounts as jest.Mock).mockResolvedValueOnce(false);

        await handleUpdateDetailsVariants(request, response);

        expect(updateDetailsAmounts).toHaveBeenCalledWith('G', 'A', 21, amounts, false);
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (updateDetailsAmounts as jest.Mock).mockRejectedValueOnce('Failed to update details');

        await handleUpdateDetailsVariants(request, response);

        expect(updateDetailsAmounts).toHaveBeenCalledWith('G', 'A', 21, amounts, false);
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update details' });
    });
});
