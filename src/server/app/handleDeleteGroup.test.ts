/** @jest-environment node */
import { type ApiDetails, type ApiRequestGroup } from '~/common/api';
import { handleDeleteGroup } from '~/server/app/handleDeleteGroup';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getGroupsResponse } from '~/server/data/groups';
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/groups');

describe('handleDeleteGroup', () => {
    const request = mockRequest<ApiRequestGroup>({ group: 'G' });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (deleteGroupOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getGroupsResponse as jest.Mock).mockResolvedValueOnce({ years, details, variants });

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getGroupsResponse).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        (deleteGroupOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (deleteGroupOccurrences as jest.Mock).mockRejectedValueOnce('Failed to delete group');

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete group' });
    });
});
