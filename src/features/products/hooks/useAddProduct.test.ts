import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useAddProduct } from '~/features/products/hooks/useAddProduct';
import { addProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useAddProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės' });

        expect(addProductAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', name: 'Avietės', parent: undefined });
    });

    it('passes parent through when given', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės (Zewa)', parent: 'Avietės' });

        expect(addProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '' });

        expect(addProductAction).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės' });

        expect(addProductAction).not.toHaveBeenCalled();
    });
});
