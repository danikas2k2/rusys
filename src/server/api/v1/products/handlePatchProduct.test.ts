// @vitest-environment node
import { handlePatchProduct } from '~/server/api/v1/products/handlePatchProduct';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePatchProduct', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePatchProduct({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
