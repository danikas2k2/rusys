import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import { moveConsumedToRecycledAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useMoveConsumedToRecycled', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls move to recycled action', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', year: 22, variant: 'd', amount: 2, flags: {} });

        expect(moveConsumedToRecycledAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 2,
            flags: {},
        });
    });

    it('passes suspicious/home flags through', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 2,
            flags: { home: true },
        });

        expect(moveConsumedToRecycledAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            variant: 'd',
            amount: 2,
            flags: {
                home: true,
            },
        });
    });

    it('does not call the action with empty group', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: '', name: 'Morkos', year: 22, variant: 'd', amount: 2 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with empty name', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: '', year: 22, variant: 'd', amount: 2 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with empty variant', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', year: 22, variant: '', amount: 2 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });

    it('does not call the action with a non-positive amount', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', year: 22, variant: 'd', amount: 0 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
    });
});
