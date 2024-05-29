/** @jest-environment node */
import { type ApiDetails, type ApiRenameDetails } from '~/common/api';
import { handleRename } from '~/server/app/handleRename';
import { getYearsAndDetails, renameDetails } from '~/server/data/details';
import { getDetailsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleRename', () => {
    const request = mockRequest<ApiRenameDetails>({ group: 'G', name: 'A', newName: 'B' });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (renameDetails as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('G', 'A', 'B');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (renameDetails as jest.Mock).mockResolvedValueOnce(false);

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('G', 'A', 'B');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (renameDetails as jest.Mock).mockRejectedValueOnce('Failed to rename details');

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('G', 'A', 'B');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename details' });
    });
});
