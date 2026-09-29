import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useDeleteGroup } from '~/store/groups/useDeleteGroup';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/groups/useGetGroups'), () => ({ useGetGroups: () => refresh }));

describe('useDeleteGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/Uogien%C4%97s', undefined, 'DELETE');
        expect(request).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
