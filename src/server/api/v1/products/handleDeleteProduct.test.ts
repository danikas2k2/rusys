// @vitest-environment node
import { handleDeleteProduct } from '~/server/api/v1/products/handleDeleteProduct';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleDeleteProduct', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleDeleteProduct({ params: { group: 'A' } } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
