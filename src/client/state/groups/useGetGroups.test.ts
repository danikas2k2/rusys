import { renderHook } from '@testing-library/react';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetGroups } from '~/client/state/groups/useGetGroups';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useGetGroups', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls get action', async () => {
        const { result } = renderHook(() => useGetGroups());
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.Groups);
    });
});
