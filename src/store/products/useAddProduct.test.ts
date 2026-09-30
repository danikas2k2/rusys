import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { addProductAction } from '~/server/actions/products';
import { useAddProduct } from '~/store/products/useAddProduct';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useAddProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(addProductAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', undefined);
    });

    it('passes parent through when given', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės (Zewa)', 'Avietės');

        expect(addProductAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės (Zewa)', 'Avietės');
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(addProductAction).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(addProductAction).not.toHaveBeenCalled();
    });
});
