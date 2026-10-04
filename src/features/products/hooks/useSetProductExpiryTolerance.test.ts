import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useSetProductExpiryTolerance } from '~/features/products/hooks/useSetProductExpiryTolerance';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductExpiryTolerance', () => {
    afterEach(() => vi.clearAllMocks());

    it('sends the expiry tolerance update', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Morkos', 365);

        expect(setProductExpiryToleranceAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Morkos', 365);
    });

    it('ignores an incomplete product identity', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('', 'Morkos', 365);
        await result.current('Daržovės', '', 365);

        expect(setProductExpiryToleranceAction).not.toHaveBeenCalled();
    });
});
