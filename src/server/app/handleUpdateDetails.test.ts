/** @jest-environment node */
import { type ApiDetails, type ApiUpdateDetails } from '~/common/api';
import { type VariantAmount } from '~/common/types';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';
import { getDetailsWithYears, updateDetails } from '~/server/data/details';
import { getDetailsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/years');

describe('handleUpdateDetails', () => {
    const amounts: VariantAmount[] = [
        { variant: 'd', amount: 2 },
        { variant: 'p', amount: -1, recycled: true },
    ];
    const request = mockRequest<ApiUpdateDetails>({
        group: 'G',
        name: 'A',
        year: 21,
        amounts,
    });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (updateDetails as jest.Mock).mockResolvedValueOnce(true);
        (getDetailsWithYears as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('G', 'A', 21, amounts);
        expect(getDetailsWithYears).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (updateDetails as jest.Mock).mockResolvedValueOnce(false);

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('G', 'A', 21, amounts);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (updateDetails as jest.Mock).mockRejectedValueOnce('Failed to update details');

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('G', 'A', 21, amounts);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update details' });
    });
});
