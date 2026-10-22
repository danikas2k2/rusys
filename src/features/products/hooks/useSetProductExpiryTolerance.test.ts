import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetProductExpiryTolerance } from '~/features/products/hooks/useSetProductExpiryTolerance';
import { setProductExpiryToleranceAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductExpiryTolerance', () => {
    afterEach(() => vi.clearAllMocks());

    it('sends the expiry tolerance update', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos', days: 365 });

        expect(setProductExpiryToleranceAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos',
            days: 365,
        });
    });

    it('ignores an incomplete product identity', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockData });
        await result.current({ group: '', name: 'Morkos', days: 365 });
        await result.current({ group: 'Daržovės', name: '', days: 365 });

        expect(setProductExpiryToleranceAction).not.toHaveBeenCalled();
    });
});
