import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/client/state/products/actions';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetProductRemoving', () => {
    const request = jest.fn();
    const dispatch = jest.fn();

    beforeAll(() => {
        jest.mocked(useUpdatingApiRequest).mockReturnValue(request);
        jest.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

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

        expect(dispatch)
            .toHaveBeenCalledWith(setProductsRemovingAction('Uogienės', 'Avietės', 21, true))
            .toHaveBeenCalledWith(rollbackProductsRemovingAction('Uogienės', 'Avietės', 21))
            .toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
