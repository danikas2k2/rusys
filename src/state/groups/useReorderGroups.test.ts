import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useReorderGroups } from '~/state/groups/useReorderGroups';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useReorderGroups', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        await result.current({ G: 3, H: 2 });

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsReorder, { groups: { G: 3, H: 2 } });
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        await result.current({});

        expect(request).not.toHaveBeenCalled();
    });
});
