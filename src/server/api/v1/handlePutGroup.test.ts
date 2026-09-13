// @vitest-environment node
import { handlePutGroup } from '~/server/api/v1/handlePutGroup';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutGroup', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutGroup({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
