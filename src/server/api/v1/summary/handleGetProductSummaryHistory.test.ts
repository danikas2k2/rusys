// @vitest-environment node
import { handleGetProductSummaryHistory } from '~/server/api/v1/summary/handleGetProductSummaryHistory';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetProductSummaryHistory', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleGetProductSummaryHistory({ params: { group: 'A', name: 'B', year: 'x' } } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
