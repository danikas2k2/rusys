// @vitest-environment node
import { handleGetVariants } from '~/server/api/v1/variants/handleGetVariants';
import { mockResponse } from '~/server/data/tests/handleResponse';
import { getVariants } from '~/server/data/variants';

vi.mock(import('~/server/data/variants'));

describe('handleGetVariants', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getVariants).mockResolvedValueOnce([]);

        await handleGetVariants({ query: {} } as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ variants: [] });
    });
});
