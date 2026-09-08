// @vitest-environment node
import { getGroups } from '~/server/data/groups';

vi.mock(import('~/server/data/groups'));

import { handleGetGroups } from '~/server/api/v1/handleGetGroups';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetGroups', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getGroups).mockResolvedValueOnce([]);

        await handleGetGroups({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ groups: [] });
    });
});
