/** @jest-environment node */
import { getDetailsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { handleAdd } from '~/server/api/handleAdd';
import { getDetailsWithYears } from '~/server/api/response';
import { addDetails } from '~/server/data/details';
import { type ApiDetailsWithYears, type ApiRequestDetails } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/details');

describe('handleAdd', () => {
    const request = mockRequest<ApiRequestDetails>({ group: 'Uogienės', name: 'Braškės' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('adds details and returns updated details with years', async () => {
        jest.mocked(addDetails).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithYears).mockResolvedValueOnce({ years, details });

        await handleAdd(request, response);

        expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(addDetails).mockResolvedValueOnce(false);

        await handleAdd(request, response);

        expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(addDetails).mockRejectedValueOnce('Failed to add');

        await handleAdd(request, response);

        expect(addDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to add' });
    });
});
