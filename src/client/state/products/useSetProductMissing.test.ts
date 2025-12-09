import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/client/state/products/actions';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetProductMissing', () => {
    const request = jest.fn();
    const dispatch = jest.fn();

    beforeAll(() => {
        jest.mocked(useUpdatingApiRequest).mockReturnValue(request);
        jest.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', true);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true));
        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', false);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', false));
        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetMissing, {
            group: 'Uogienės',
            name: 'Avietės',
            missing: false,
        });
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('', 'Avietės', true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', '', true);

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('rolls back and sets error when request fails', async () => {
        const error = new Error('Request failed');
        request.mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });

        await result.current('Uogienės', 'Avietės', true);

        expect(dispatch)
            .toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true))
            .toHaveBeenCalledWith(rollbackProductsMissingAction('Uogienės', 'Avietės'))
            .toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
