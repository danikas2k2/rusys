// @vitest-environment node
import { handleProductReviewStatuses } from '~/server/api/v1/handleProductReviewStatuses';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleProductReviewStatuses', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleProductReviewStatuses({ body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
