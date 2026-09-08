// @vitest-environment node
import { handlePutUserProfile } from '~/server/api/v1/handlePutUserProfile';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePutUserProfile', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePutUserProfile({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
