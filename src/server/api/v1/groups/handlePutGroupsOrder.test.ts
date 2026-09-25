// @vitest-environment node
import { handlePutGroupsOrder } from '~/server/api/v1/groups/handlePutGroupsOrder';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutGroupsOrder', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutGroupsOrder({ body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
