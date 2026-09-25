// @vitest-environment node
import { handlePostAmountHistoryRedo } from '~/server/api/v1/products/handlePostAmountHistoryRedo';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePostAmountHistoryRedo', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePostAmountHistoryRedo({ params: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
