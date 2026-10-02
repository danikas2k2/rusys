import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useMoveProduct } from '~/features/products/hooks/useMoveProduct';
import { moveProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useMoveProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Daržovės');

        expect(moveProductAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 'Daržovės', undefined);
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Uogienės');

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Daržovės');

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Daržovės');

        expect(moveProductAction).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(moveProductAction).not.toHaveBeenCalled();
    });
});
