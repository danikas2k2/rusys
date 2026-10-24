import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useDeleteProduct } from '~/features/products/hooks/useDeleteProduct';
import { deleteProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useRemoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

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
