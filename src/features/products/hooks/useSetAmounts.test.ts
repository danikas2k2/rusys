import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetAmounts } from '~/features/products/hooks/useSetAmounts';
import { setAmountsAction, setAmountsBatchAction } from '~/server/actions/products';

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

describe('useSetAmounts', () => {
    afterEach(() => vi.clearAllMocks());

    it('submits multiple years together and refreshes after success', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        const requests = [
            { group: 'Uogienės', name: 'Avietės', year: 23, amounts: [{ variant: 'p', amount: -1 }] },
            { group: 'Uogienės', name: 'Avietės', year: 24, amounts: [{ variant: 'p', amount: -2, recycled: true }] },
        ];

        await result.current(requests);

        expect(setAmountsBatchAction).toHaveBeenCalledWith(requests);
        expect(setAmountsAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('ignores an empty batch', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current([]);

        expect(setAmountsBatchAction).not.toHaveBeenCalled();
        expect(refresh).not.toHaveBeenCalled();
    });

    it('propagates a failed batch without refreshing', async () => {
        const error = new Error('Save failed');
        vi.mocked(setAmountsBatchAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        const requests = [
            { group: 'Uogienės', name: 'Avietės', year: 23, amounts: [{ variant: 'p', amount: -1 }] },
            { group: 'Uogienės', name: 'Avietės', year: 24, amounts: [{ variant: 'p', amount: -1 }] },
        ];

        await expect(result.current(requests)).rejects.toThrow('Save failed');
        expect(refresh).not.toHaveBeenCalled();
    });

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', year: 25, amounts: [{ variant: 'p', amount: 1 }] });

        expect(setAmountsAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 25,
            amounts: [{ variant: 'p', amount: 1 }],
            comment: undefined,
        });
    });

    it('passes the comment through with the stock changes', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current({
            group: 'Uogienės',
            name: 'Avietės',
            year: 25,
            amounts: [{ variant: 'p', amount: 1 }],
            comment: 'Correction',
        });

        expect(setAmountsAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 25,
            amounts: [{ variant: 'p', amount: 1 }],
            comment: 'Correction',
        });
    });

    it('calls update action with zero year (non-annual)', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', year: 0, amounts: [{ variant: 'p', amount: -1 }] });

        expect(setAmountsAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 0,
            amounts: [{ variant: 'p', amount: -1 }],
            comment: undefined,
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', year: 25, amounts: [{ variant: 'p', amount: 1 }] });

        expect(setAmountsAction).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', year: 25, amounts: [{ variant: 'p', amount: 1 }] });

        expect(setAmountsAction).not.toHaveBeenCalled();
    });
});
