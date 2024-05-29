/** @jest-environment node */
import { type Group } from '~/common/types';
import { handleUpdateGroup } from '~/server/app/handleUpdateGroup';
import { updateGroup } from '~/server/data/groups';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/groups');

describe('handleUpdateGroup', () => {
    const request = mockRequest<Group>({ group: 'G', order: 3 });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (updateGroup as jest.Mock).mockResolvedValueOnce(true);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('G', 3);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        (updateGroup as jest.Mock).mockResolvedValueOnce(false);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('G', 3);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (updateGroup as jest.Mock).mockRejectedValueOnce('Failed to update group');

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('G', 3);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update group' });
    });
});
