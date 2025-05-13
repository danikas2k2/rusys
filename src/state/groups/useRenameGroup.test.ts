import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useRenameGroup } from '~/state/groups/useRenameGroup';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useRenameGroup', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('G', 'H');

        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsRename, { group: 'G', newGroup: 'H' });
    });

    it('does not call rename action with same group', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('G', 'G');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('', 'G');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new group', async () => {
        const { result } = renderHook(() => useRenameGroup(), { wrapper: MockRedux });
        await result.current('G', '');

        expect(request).not.toHaveBeenCalled();
    });
});
