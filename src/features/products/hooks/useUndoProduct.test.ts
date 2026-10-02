import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUndoProduct } from '~/features/products/hooks/useUndoProduct';
import { undoProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useUndoProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls undo action', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(undoProductAction).toHaveBeenCalledWith('Uogienės', 'Avietės', 25);
    });

    it('does not call undo action with blank name', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(undoProductAction).not.toHaveBeenCalled();
    });

    it('does not call undo action with blank group', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(undoProductAction).not.toHaveBeenCalled();
    });
});
