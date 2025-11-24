/** @jest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { updateGroup } from '~/server/data/groups';
import type { Group } from '~/types/data';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/groups');

describe('handleUpdateGroup', () => {
    const request = mockRequest<Group>({ group: 'Uogienės', order: 3 });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(updateGroup).mockResolvedValueOnce(true);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(updateGroup).mockResolvedValueOnce(false);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(updateGroup).mockRejectedValueOnce('Failed to update group');

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update group' });
    });
});
