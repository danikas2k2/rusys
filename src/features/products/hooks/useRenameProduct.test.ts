import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useRenameProduct } from '~/features/products/hooks/useRenameProduct';
import { renameProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useRenameProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: 'Gervuogės' });

        expect(renameProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            targetName: 'Gervuogės',
        });
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: 'Avietės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', targetName: 'Avietės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: '' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', targetName: 'Gervuogės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });
});
