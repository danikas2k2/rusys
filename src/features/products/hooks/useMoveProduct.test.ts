import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useMoveProduct } from '~/features/products/hooks/useMoveProduct';
import { moveProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useMoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', newGroup: 'Daržovės' });

        expect(moveProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            newGroup: 'Daržovės',
            newName: undefined,
        });
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', newGroup: 'Uogienės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', newGroup: 'Daržovės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', newGroup: 'Daržovės' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', newGroup: '' });

        expect(moveProductAction).not.toHaveBeenCalled();
    });
});
