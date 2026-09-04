import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useUpdateGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsUpdate, { group: 'Uogienės' });
    });

    it('calls update action with annual parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true);

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsUpdate, { group: 'Uogienės', annual: true });
    });

    it('calls update action with review parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', true, true);

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsUpdate, {
            group: 'Uogienės',
            annual: true,
            review: true,
        });
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
