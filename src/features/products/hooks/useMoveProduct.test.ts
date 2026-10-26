import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useMoveProduct } from '~/features/products/hooks/useMoveProduct';
import { trackFaroEvent } from '~/lib/observability/faro';
import { moveProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useMoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(moveProductAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product', targetGroup: 'Private target' };

        await expect(result.current(request)).rejects.toBe(error);

        expect(moveProductAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'move', result: 'started' }],
            ['data_action', { entity: 'product', action: 'move', result: 'error' }],
        ]);
    });

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetGroup: 'Daržovės' });

        expect(moveProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            targetGroup: 'Daržovės',
            targetName: undefined,
        });
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetGroup: 'Uogienės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', targetGroup: 'Daržovės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', targetGroup: 'Daržovės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetGroup: '' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });
});
