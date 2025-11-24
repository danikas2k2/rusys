import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useGetProducts', () => {
    const request = jest.fn();

    beforeEach(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('request data from /products and update current state', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(request).toHaveBeenCalledWith('/products');
    });
});
