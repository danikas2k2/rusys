import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useDeleteGroup', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), withReduxState());
        await result.current('G');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsDelete, { group: 'G' });
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), withReduxState());
        await result.current('');

        expect(request).not.toHaveBeenCalled();
    });
});
