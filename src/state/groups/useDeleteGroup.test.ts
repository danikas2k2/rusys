import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useDeleteGroup', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('Uogienės');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsDelete, { group: 'Uogienės' });
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
