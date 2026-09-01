import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductExpiryTolerance } from '~/client/state/products/useSetProductExpiryTolerance';
import { ApiUrl } from '~/types/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useSetProductExpiryTolerance', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('sends the expiry tolerance update', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai', 365);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetExpiryTolerance, {
            group: 'Daržovės',
            name: 'Agurkai',
            expiryToleranceDays: 365,
        });
    });
});
