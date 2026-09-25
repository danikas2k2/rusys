// @vitest-environment node
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePatchGroup', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePatchGroup({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
