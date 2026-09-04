import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useReorderGroups', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        const groups = { Uogienės: 3, Daržovės: 2 };
        await result.current(groups);

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsReorder, { groups });
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        await result.current({});

        expect(request).not.toHaveBeenCalled();
    });
});
