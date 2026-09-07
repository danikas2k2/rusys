import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/client/state/products/actions';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetProductMissing', () => {
    const request = vi.fn();
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', true);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true));
        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s',
            { missing: true },
            'PATCH'
        );
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetProductMissing(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', false);

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', false));
        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s',
            { missing: false },
            'PATCH'
        );
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

        expect(dispatch).toHaveBeenCalledWith(setProductsMissingAction('Uogienės', 'Avietės', true));
        expect(dispatch).toHaveBeenCalledWith(rollbackProductsMissingAction('Uogienės', 'Avietės'));
        expect(dispatch).toHaveBeenCalledWith(setErrorAction('Request failed'));
    });
});
