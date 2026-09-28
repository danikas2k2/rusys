import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';
import { useGetVariants } from '~/store/variants/useGetVariants';

vi.mock(import('~/store/common/useSuspenseApiRequest'));

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
