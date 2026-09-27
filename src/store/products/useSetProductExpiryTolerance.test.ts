import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useSetProductExpiryTolerance } from '~/store/products/useSetProductExpiryTolerance';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

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

    it('ignores an incomplete product identity', async () => {
        const { result } = renderHook(() => useSetProductExpiryTolerance(), { wrapper: MockRedux });
        await result.current('', 'Agurkai', 365);
        await result.current('Daržovės', '', 365);

        expect(request).not.toHaveBeenCalled();
    });
});
