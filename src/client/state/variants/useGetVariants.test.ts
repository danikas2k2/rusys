import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useGetVariants', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads variants and groups', async () => {
        const { result } = renderHook(() => useGetVariants());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/variants', 'GET');
        expect(request).toHaveBeenCalledWith('/api/v1/groups', 'GET');
    });
});
