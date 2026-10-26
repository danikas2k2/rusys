import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useDeleteProduct } from '~/features/products/hooks/useDeleteProduct';
import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { trackFaroEvent } from '~/lib/observability/faro';
import { deleteProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useRemoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(deleteProductAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product' };

        await expect(result.current(request)).rejects.toBe(error);

        expect(deleteProductAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'delete', result: 'started' }],
            ['data_action', { entity: 'product', action: 'delete', result: 'error' }],
        ]);
    });

    it('calls remove action', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės' });

        expect(deleteProductAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', name: 'Avietės' });
    });

    it('does not call remove action with empty name', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '' });

        expect(deleteProductAction).not.toHaveBeenCalled();
    });

    it('does not call remove action with empty group', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės' });

        expect(deleteProductAction).not.toHaveBeenCalled();
    });
});
