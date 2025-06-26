/** @jest-environment node */
import { getDetailsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { handleUpdateDetails } from '~/server/api/handleUpdateDetails';
import { getDetailsWithYears } from '~/server/api/response';
import { updateDetails } from '~/server/data/details';
import { DEV_MODE_EMAIL } from '~/state/profile/dev';
import { type ApiDetailsWithYears, type ApiUpdateDetails } from '~/types/api';
import { type VariantAmount } from '~/types/data';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/details');
jest.mock('~/server/data/years');
jest.mock('~/server/data/years');

describe('handleUpdateDetails', () => {
    const user = DEV_MODE_EMAIL;
    const amounts: VariantAmount[] = [
        { variant: 'd', amount: 2 },
        { variant: 'p', amount: -1, recycled: true },
    ];
    const request = mockRequest<ApiUpdateDetails>({
        group: 'Uogienės',
        name: 'Braškės',
        year: 21,
        amounts,
        user,
    });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(updateDetails).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithYears).mockResolvedValueOnce({ years, details });

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user);
        expect(getDetailsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(updateDetails).mockResolvedValueOnce(false);

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(updateDetails).mockRejectedValueOnce('Failed to update details');

        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update details' });
    });
});
