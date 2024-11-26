/** @jest-environment node */
import { type ApiDetails, type ApiRequestDetails } from '~/common/api';
import { handleDelete } from '~/server/app/handleDelete';
import { deleteDetails, getDetailsWithYears } from '~/server/data/details';
import { getDetailsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleDelete', () => {
    const request = mockRequest<ApiRequestDetails>({ group: 'G', name: 'A' });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (deleteDetails as jest.Mock).mockResolvedValueOnce(true);
        (getDetailsWithYears as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('G', 'A');
        expect(getDetailsWithYears).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (deleteDetails as jest.Mock).mockResolvedValueOnce(false);

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('G', 'A');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (deleteDetails as jest.Mock).mockRejectedValueOnce('Failed to delete');

        await handleDelete(request, response);

        expect(deleteDetails).toHaveBeenCalledWith('G', 'A');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete' });
    });
});
