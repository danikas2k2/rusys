/** @jest-environment node */
import { getDetailsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears, type ApiRenameDetails } from '~/common/api';
import { handleRename } from '~/server/app/handleRename';
import { getDetailsWithYears, renameDetails } from '~/server/data/details';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleRename', () => {
    const request = mockRequest<ApiRenameDetails>({ group: 'Uogienės', name: 'Braškės', newName: 'B' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(renameDetails).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithYears).mockResolvedValueOnce({ years, details });

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 'B');
        expect(getDetailsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(renameDetails).mockResolvedValueOnce(false);

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 'B');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(renameDetails).mockRejectedValueOnce('Failed to rename details');

        await handleRename(request, response);

        expect(renameDetails).toHaveBeenCalledWith('Uogienės', 'Braškės', 'B');
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename details' });
    });
});
