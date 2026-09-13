// @vitest-environment node
import { handlePostAmountHistory } from '~/server/api/v1/handlePostAmountHistory';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePostAmountHistory', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePostAmountHistory({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
