import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useSetProductExpiryTolerance } from '~/features/products/hooks/useSetProductExpiryTolerance';
import { trackFaroEvent } from '~/lib/observability/faro';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useSetProductExpiryTolerance', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(setProductExpiryToleranceAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product', days: 365 };

        await expect(result.current(request)).rejects.toBe(error);

        expect(setProductExpiryToleranceAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'set_expiry_tolerance', result: 'started' }],
            ['data_action', { entity: 'product', action: 'set_expiry_tolerance', result: 'error' }],
        ]);
    });

    it('sends the expiry tolerance update', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', days: 365 });

        expect(setProductExpiryToleranceAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos',
            days: 365,
        });
    });

    it('ignores an incomplete product identity', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockData });
        await result.current({ group: '', name: 'Morkos', days: 365 });
        await result.current({ group: 'Daržovės', name: '', days: 365 });

        expect(setProductExpiryToleranceAction).not.toHaveBeenCalled();
    });
});
