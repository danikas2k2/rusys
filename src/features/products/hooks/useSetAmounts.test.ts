import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetAmounts } from '~/features/products/hooks/useSetAmounts';
import { setAmountsAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetAmounts', () => {
    afterEach(() => vi.clearAllMocks());

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
