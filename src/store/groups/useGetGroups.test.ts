import { renderHook } from '@testing-library/react';

import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';
import { useGetGroups } from '~/store/groups/useGetGroups';

vi.mock(import('~/store/common/useSuspenseApiRequest'));

describe('useGetGroups', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useSuspenseApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls get action', async () => {
        const { result } = renderHook(() => useGetGroups());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/groups', undefined);
    });
});
