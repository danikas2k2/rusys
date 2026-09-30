import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { setProductRemovingAction } from '~/server/actions/products';
import { setErrorAction } from '~/store/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/store/products/actions';
import { useSetProductRemoving } from '~/store/products/useSetProductRemoving';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetProductRemoving', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 21, true);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 21, true));
        expect(setProductRemovingAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 21, true);
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 22, false);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 22, false));
        expect(setProductRemovingAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', 22, false);
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('', 'Avietės', 21, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(setProductRemovingAction).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', '', 21, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(setProductRemovingAction).not.toHaveBeenCalled();
    });

    it('does not call request when year is 0', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', 0, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(setProductRemovingAction).not.toHaveBeenCalled();
    });

    it('rolls back and sets error when request fails', async () => {
        const error = new Error('Request failed');
        vi.mocked(setProductRemovingAction).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', 21, true);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 21, true));
        expect(dispatch).toHaveBeenCalledWith(rollbackProductsRemovingAction('Uogienės', 'Avietės', 21));
        expect(dispatch).toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
