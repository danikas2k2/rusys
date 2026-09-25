// @vitest-environment node
import { handlePostAmountHistoryUndo } from '~/server/api/v1/products/handlePostAmountHistoryUndo';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePostAmountHistoryUndo', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePostAmountHistoryUndo({ params: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
