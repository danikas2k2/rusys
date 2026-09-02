import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/client/state/products/actions';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetProductRemoving', () => {
    const request = vi.fn();
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 21, true);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 21, true));
        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 21,
            removing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 22, false);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 22, false));
        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            removing: false,
        });
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('', 'Avietės', 21, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', '', 21, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when year is 0', async () => {
        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', 0, true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('rolls back and sets error when request fails', async () => {
        const error = new Error('Request failed');
        request.mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSetProductRemoving(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', 21, true);

        expect(dispatch).toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 21, true));
        expect(dispatch).toHaveBeenCalledWith(rollbackProductsRemovingAction('Uogienės', 'Avietės', 21));
        expect(dispatch).toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
