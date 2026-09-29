import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';

vi.mock(import('~/store/common/useSuspenseApiRequest'));

describe('useGetProducts', () => {
    const request = vi.fn();

    beforeEach(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('refreshes products and their dependent collections in one server operation', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/products');
        expect(request).toHaveBeenCalledTimes(1);
    });

    it('loads all collections for an unseeded initial render', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current(true);

        expect(request).toHaveBeenCalledWith('/api/v1/products', true);
        expect(request).toHaveBeenCalledWith('/api/v1/groups', true);
        expect(request).toHaveBeenCalledWith('/api/v1/variants', true);
    });
});
