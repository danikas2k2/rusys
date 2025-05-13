/** @jest-environment node */
import { getDetailsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears, type ApiRequestDetails } from '~/common/api';
import { handleDelete } from '~/server/app/handleDelete';
import { deleteDetails, getDetailsWithYears } from '~/server/data/details';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleDelete', () => {
    const request = mockRequest<ApiRequestDetails>({ group: 'Uogienės', name: 'Braškės' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('removes details and returns updated details with years', async () => {
        jest.mocked(deleteDetails).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithYears).mockResolvedValueOnce({ years, details });

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(deleteDetails).mockResolvedValueOnce(false);

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(deleteDetails).mockRejectedValueOnce('Failed to delete');

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete' });
    });
});
