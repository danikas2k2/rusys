import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetProductImage } from '~/client/state/products/useSetProductImage';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useSetProductImage', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls set image action', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', 'data:image/png;base64,AAA');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsSetImage, {
            group: 'Uogienės',
            name: 'Braškės',
            image: 'data:image/png;base64,AAA',
        });
    });

    it('does not call set image action with empty group', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('', 'Braškės', 'data:image/png;base64,AAA');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call set image action with empty name', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'data:image/png;base64,AAA');

        expect(request).not.toHaveBeenCalled();
    });
});
