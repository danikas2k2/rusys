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

    it('refreshes variants and groups in one server operation', async () => {
        const { result } = renderHook(() => useGetVariants());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/variants');
        expect(request).toHaveBeenCalledTimes(1);
    });

    it('loads variants and groups for an unseeded initial render', async () => {
        const { result } = renderHook(() => useGetVariants());
        await result.current(true);

        expect(request).toHaveBeenCalledWith('/api/v1/variants', true);
        expect(request).toHaveBeenCalledWith('/api/v1/groups', true);
    });
});
