import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { moveConsumedToRecycledAction } from '~/server/actions/products';
import { useMoveConsumedToRecycled } from '~/store/products/useMoveConsumedToRecycled';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useMoveConsumedToRecycled', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls move to recycled action', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 2, {}, 'user@example.com');

        expect(moveConsumedToRecycledAction).toHaveBeenNthCalledWith(
            1,
            'Daržovės',
            'Agurkai',
            22,
            'd',
            2,
            {},
            'user@example.com'
        );
    });

    it('passes suspicious/home flags through', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 2, { home: true });

        expect(moveConsumedToRecycledAction).toHaveBeenNthCalledWith(
            1,
            'Daržovės',
            'Agurkai',
            22,
            'd',
            2,
            { home: true },
            undefined
        );
    });

    it('does not call the action with empty group', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('', 'Agurkai', 22, 'd', 2);

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with empty name', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', '', 22, 'd', 2);

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with empty variant', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, '', 2);

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with a non-positive amount', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 22, 'd', 0);

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });
});
