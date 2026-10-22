import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useRedoProduct } from '~/features/products/hooks/useRedoProduct';
import { redoProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useRedoProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls redo action', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', year: 25 });

        expect(redoProductAction).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year: 25 });
    });

    it('does not call redo action with blank name', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', year: 25 });

        expect(redoProductAction).not.toHaveBeenCalled();
    });

    it('does not call redo action with blank group', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', year: 25 });

        expect(redoProductAction).not.toHaveBeenCalled();
    });
});
