import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/client/state/common/useSuspenseApiRequest';
import { useGetVariants } from '~/client/state/variants/useGetVariants';

vi.mock(import('~/client/state/common/useSuspenseApiRequest'));

describe('useGetVariants', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('loads variants and groups', async () => {
        const { result } = renderHook(() => useGetVariants());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/variants');
        expect(request).toHaveBeenCalledWith('/api/v1/groups');
    });
});
