import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import { trackFaroEvent } from '~/lib/observability/faro';
import { moveConsumedToRecycledAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

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
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('does not call the action with empty name', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: '', year: 22, variant: 'd', amount: 2 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('does not call the action with empty variant', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', year: 22, variant: '', amount: 2 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('does not call the action with a non-positive amount', async () => {
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', year: 22, variant: 'd', amount: 0 });

        expect(moveConsumedToRecycledAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('reports the mutation outcome even when the subsequent cache refresh fails', async () => {
        refresh.mockRejectedValueOnce(new Error('cache refresh failed'));
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });

        await expect(
            result.current({
                group: 'private group',
                name: 'private product',
                year: 22,
                variant: 'private variant',
                amount: 2,
            })
        ).rejects.toThrow('cache refresh failed');
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'stock', action: 'recycle', result: 'started' }],
            ['data_action', { entity: 'stock', action: 'recycle', result: 'success' }],
        ]);
    });

    it('reports and propagates a mutation failure without refreshing', async () => {
        vi.mocked(moveConsumedToRecycledAction).mockRejectedValueOnce(new Error('private failure'));
        const { result } = renderHook(() => useMoveConsumedToRecycled(), { wrapper: MockData });

        await expect(
            result.current({
                group: 'private group',
                name: 'private product',
                year: 22,
                variant: 'private variant',
                amount: 2,
            })
        ).rejects.toThrow('private failure');
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'stock', action: 'recycle', result: 'started' }],
            ['data_action', { entity: 'stock', action: 'recycle', result: 'error' }],
        ]);
        expect(refresh).not.toHaveBeenCalled();
    });
});
