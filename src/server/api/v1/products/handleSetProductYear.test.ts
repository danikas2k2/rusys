// @vitest-environment node
import { handleSetProductYear } from '~/server/api/v1/products/handleSetProductYear';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleSetProductYear', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleSetProductYear({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
