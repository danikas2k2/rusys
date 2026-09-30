import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { setProductExpiryToleranceAction } from '~/server/actions/products';
import { useSetProductExpiryTolerance } from '~/store/products/useSetProductExpiryTolerance';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductExpiryTolerance', () => {
    afterEach(() => vi.clearAllMocks());

    it('sends the expiry tolerance update', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 365);

        expect(setProductExpiryToleranceAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Agurkai', 365);
    });

    it('ignores an incomplete product identity', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('', 'Agurkai', 365);
        await result.current('Daržovės', '', 365);

        expect(setProductExpiryToleranceAction).not.toHaveBeenCalled();
    });
});
