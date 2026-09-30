import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { setAmountsAction } from '~/server/actions/products';
import { useSetAmounts } from '~/store/products/useSetAmounts';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetAmounts', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25, [{ variant: 'p', amount: 1 }]);

        expect(setAmountsAction).toHaveBeenNthCalledWith(
            1,
            'Uogienės',
            'Avietės',
            25,
            [{ variant: 'p', amount: 1 }],
            undefined,
            undefined
        );
    });

    it('calls update action without amounts', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(setAmountsAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 25, undefined, undefined, undefined);
    });

    it('calls update action with zero year (non-annual)', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 0);

        expect(setAmountsAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 0, undefined, undefined, undefined);
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(setAmountsAction).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useSetAmounts(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(setAmountsAction).not.toHaveBeenCalled();
    });
});
