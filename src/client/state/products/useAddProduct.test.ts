import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useAddProduct', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsAdd, {
            group: 'Uogienės',
            name: 'Avietės',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });
});
