import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleMoveConsumedToRecycled } from '~/server/api/handleMoveConsumedToRecycled';
import { moveConsumedToRecycled } from '~/server/data/products';
import type { ApiMoveConsumedToRecycled } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/products'));

describe('handleMoveConsumedToRecycled', () => {
    const request = mockRequest<ApiMoveConsumedToRecycled>({
        group: 'Daržovės',
        name: 'Agurkai',
        year: 22,
        time: 1000,
        variant: 'd',
        amount: 2,
        user: 'user@example.com',
    });
    const response = mockResponse();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        await handleMoveConsumedToRecycled(request, response);

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            2,
            { suspicious: undefined, home: undefined },
            'user@example.com'
        );
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('passes suspicious/home flags through', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        await handleMoveConsumedToRecycled(
            mockRequest<ApiMoveConsumedToRecycled>({
                group: 'Daržovės',
                name: 'Agurkai',
                year: 22,
                time: 1000,
                variant: 'd',
                amount: 2,
                home: true,
            }),
            response
        );

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            2,
            { suspicious: undefined, home: true },
            undefined
        );
    });

    it('passes expiresAt through', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        await handleMoveConsumedToRecycled(
            mockRequest<ApiMoveConsumedToRecycled>({
                group: 'Daržovės',
                name: 'Agurkai',
                year: 22,
                time: 1000,
                variant: 'd',
                amount: 2,
                expiresAt: 1_700_000_000_000,
            }),
            response
        );

        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            22,
            1000,
            'd',
            2,
            { suspicious: undefined, home: undefined, expiresAt: 1_700_000_000_000 },
            undefined
        );
    });

    it('returns ok response with no extra data when nothing changed', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(false);

        await handleMoveConsumedToRecycled(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(moveConsumedToRecycled).mockRejectedValueOnce('Failed to move amount');

        await handleMoveConsumedToRecycled(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move amount' });
    });
});
