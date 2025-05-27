import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useUpdateGroup } from '~/state/groups/useUpdateGroup';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useUpdateGroup', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsUpdate, { group: 'Uogienės' });
    });

    it('calls update action with order parameter', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('Uogienės', 2);

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsUpdate, { group: 'Uogienės', order: 2 });
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
