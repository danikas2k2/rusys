import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { redoProductAction } from '~/server/actions/products';
import { useRedoProduct } from '~/store/products/useRedoProduct';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useRedoProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls redo action', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(redoProductAction).toHaveBeenCalledWith('Uogienės', 'Avietės', 25);
    });

    it('does not call redo action with blank name', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(redoProductAction).not.toHaveBeenCalled();
    });

    it('does not call redo action with blank group', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(redoProductAction).not.toHaveBeenCalled();
    });
});
