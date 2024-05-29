import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { GroupsActionType } from '~/state/groups/actions';
import { useRenameGroup } from '~/state/groups/useRenameGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRenameGroup', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', 'H');
        expect(dispatch).toHaveBeenCalledWith({ type: GroupsActionType.RENAME, group: 'G', newGroup: 'H' });
        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsRename, { group: 'G', newGroup: 'H' });
    });

    it('does not call rename action with same group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', 'G');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('', 'G');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
