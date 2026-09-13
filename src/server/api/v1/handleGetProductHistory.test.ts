// @vitest-environment node
import { handleGetProductHistory } from '~/server/api/v1/handleGetProductHistory';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetProductHistory', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleGetProductHistory({ params: { group: 'A', name: 'B', year: 'x' } } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
