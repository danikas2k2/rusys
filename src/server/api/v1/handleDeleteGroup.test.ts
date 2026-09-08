// @vitest-environment node
import { handleDeleteGroup } from '~/server/api/v1/handleDeleteGroup';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleDeleteGroup', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleDeleteGroup({ params: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
