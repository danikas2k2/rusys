import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { setProductMissingAction } from '~/server/actions/products';
import { setErrorAction } from '~/store/error/actions';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/store/products/actions';
import { useSetProductMissing } from '~/store/products/useSetProductMissing';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetProductMissing', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', true);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true));
        expect(setProductMissingAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', true);
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', false);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', false));
        expect(setProductMissingAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės', false);
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('', 'Avietės', true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(setProductMissingAction).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', '', true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(setProductMissingAction).not.toHaveBeenCalled();
    });

    it('rolls back and sets error when request fails', async () => {
        const error = new Error('Request failed');
        vi.mocked(setProductMissingAction).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', true);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true));
        expect(dispatch).toHaveBeenCalledWith(rollbackProductsMissingAction('Uogienės', 'Avietės'));
        expect(dispatch).toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
