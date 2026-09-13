// @vitest-environment node
import { handleAccess } from '~/server/api/v1/handleAccess';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleAccess', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleAccess({ query: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
