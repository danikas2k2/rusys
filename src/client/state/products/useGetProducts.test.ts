import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/client/state/common/useSuspenseApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

vi.mock(import('~/client/state/common/useSuspenseApiRequest'));

describe('useGetProducts', () => {
    const request = vi.fn();

    beforeEach(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads products and their dependent collections', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/products');
        expect(request).toHaveBeenCalledWith('/api/v1/groups');
        expect(request).toHaveBeenCalledWith('/api/v1/variants');
    });
});
