import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useUndoProduct } from '~/features/products/hooks/useUndoProduct';
import { undoProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useUndoProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls undo action', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', year: 25 });

        expect(undoProductAction).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year: 25 });
    });

    it('does not call undo action with blank name', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', year: 25 });

        expect(undoProductAction).not.toHaveBeenCalled();
    });

    it('does not call undo action with blank group', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', year: 25 });

        expect(undoProductAction).not.toHaveBeenCalled();
    });
});
