import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useGetProducts', () => {
    const request = vi.fn();

    beforeEach(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('request data from /products and update current state', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(request).toHaveBeenCalledWith('/products');
    });
});
