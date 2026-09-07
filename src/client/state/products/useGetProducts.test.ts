import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetProducts } from '~/client/state/products/useGetProducts';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useGetProducts', () => {
    const request = vi.fn();

    beforeEach(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads products and their dependent collections', async () => {
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/products', 'GET');
        expect(request).toHaveBeenCalledWith('/api/v1/groups', 'GET');
        expect(request).toHaveBeenCalledWith('/api/v1/variants', 'GET');
    });
});
