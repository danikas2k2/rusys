/** @vitest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { Variant } from '@rusys/common/data';

import { handleUpdateVariant } from '~/server/api/handleUpdateVariant';
import { updateVariant } from '~/server/data/variants';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/variants'));

describe('handleUpdateVariant', () => {
    const request = mockRequest<Variant>({ group: 'Uogienės', variant: 'd', order: 3 });
    const response = mockResponse();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(true);

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('Uogienės', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(false);

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('Uogienės', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(updateVariant).mockRejectedValueOnce('Failed to update variant');

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('Uogienės', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update variant' });
    });
});
