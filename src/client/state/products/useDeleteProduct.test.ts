import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useRemoveProduct', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls remove action', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsDelete, { group: 'Uogienės', name: 'Avietės' });
    });

    it('does not call remove action with empty name', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call remove action with empty group', async () => {
        const { result } = renderHook(() => useDeleteProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });
});
