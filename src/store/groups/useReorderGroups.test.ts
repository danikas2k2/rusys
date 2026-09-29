import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useReorderGroups } from '~/store/groups/useReorderGroups';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => refresh }));

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

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/order', { groups }, 'PUT');
        expect(request).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), { wrapper: MockRedux });
        await result.current({});

        expect(request).not.toHaveBeenCalled();
    });
});
