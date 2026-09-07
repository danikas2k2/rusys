import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiV1 } from '@rusys/common/api/v1';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetVariantImage } from '~/client/state/products/useSetVariantImage';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useSetVariantImage', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls set variant image action', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');

        expect(request).toHaveBeenCalledWith(
            ApiV1.productVariantImage('Uogienės', 'Braškės', '0.5l'),
            { image: 'data:image/png;base64,AAA' },
            'PUT'
        );
    });

    it('does not call set variant image action with empty group', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('', 'Braškės', '0.5l', 'data:image/png;base64,AAA');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty name', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', '', '0.5l', 'data:image/png;base64,AAA');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty variant', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', '', 'data:image/png;base64,AAA');

        expect(request).not.toHaveBeenCalled();
    });
});
