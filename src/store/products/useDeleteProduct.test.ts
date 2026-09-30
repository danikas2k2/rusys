import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { deleteProductAction } from '~/server/actions/products';
import { useDeleteProduct } from '~/store/products/useDeleteProduct';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useRemoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls remove action', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(deleteProductAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės');
    });

    it('does not call remove action with empty name', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(deleteProductAction).not.toHaveBeenCalled();
    });

    it('does not call remove action with empty group', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(deleteProductAction).not.toHaveBeenCalled();
    });
});
