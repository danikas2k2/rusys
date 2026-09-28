// @vitest-environment node
import { handleGetGroups } from '~/server/api/v1/groups/handleGetGroups';
import { getGroups } from '~/server/data/groups';
import { mockResponse } from '~/server/data/tests/handleResponse';

vi.mock(import('~/server/data/groups'));

describe('handleGetGroups', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getGroups).mockResolvedValueOnce([]);

        await handleGetGroups({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ groups: [] });
    });
});
