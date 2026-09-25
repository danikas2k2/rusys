// @vitest-environment node
import { handlePutProductAmounts } from '~/server/api/v1/products/handlePutProductAmounts';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutProductAmounts', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutProductAmounts({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
