import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useDeleteGroup', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

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
