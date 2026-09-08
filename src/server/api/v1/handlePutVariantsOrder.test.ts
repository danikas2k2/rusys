// @vitest-environment node
import { handlePutVariantsOrder } from '~/server/api/v1/handlePutVariantsOrder';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutVariantsOrder', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutVariantsOrder({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
