import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { GroupsActionType } from '~/state/groups/actions';
import { useDeleteGroup } from '~/state/groups/useDeleteGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useDeleteGroup', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteGroup(), withReduxState());
        await result.current('G');
        expect(dispatch).toHaveBeenCalledWith({ type: GroupsActionType.DELETE, group: 'G' });
        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsDelete, { group: 'G' });
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteGroup(), withReduxState());
        await result.current('');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
