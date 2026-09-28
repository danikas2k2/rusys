// @vitest-environment node
import { handlePutProductImage } from '~/server/api/v1/products/handlePutProductImage';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutProductImage', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutProductImage({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
