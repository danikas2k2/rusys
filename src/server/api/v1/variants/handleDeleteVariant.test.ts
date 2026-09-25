// @vitest-environment node
import { handleDeleteVariant } from '~/server/api/v1/variants/handleDeleteVariant';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleDeleteVariant', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleDeleteVariant({ params: { group: 'A' } } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
