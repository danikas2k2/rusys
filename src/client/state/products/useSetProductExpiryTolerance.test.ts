import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductExpiryTolerance } from '~/client/state/products/useSetProductExpiryTolerance';

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

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai',
            { expiryToleranceDays: 365 },
            'PATCH'
        );
    });
});
