import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useRenameProduct } from '~/features/products/hooks/useRenameProduct';
import { renameProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useRenameProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Gervuogės');

        expect(renameProductAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 'Gervuogės');
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Avietės');

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Avietės');

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Gervuogės');

        expect(renameProductAction).not.toHaveBeenCalled();
    });
});
