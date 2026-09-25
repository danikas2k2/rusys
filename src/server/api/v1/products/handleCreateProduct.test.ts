// @vitest-environment node
import { handleCreateProduct } from '~/server/api/v1/products/handleCreateProduct';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleCreateProduct', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleCreateProduct({ body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
