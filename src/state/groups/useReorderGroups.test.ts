import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { GroupsActionType } from '~/state/groups/actions';
import { useReorderGroups } from '~/state/groups/useReorderGroups';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useReorderGroups', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderGroups(), withReduxState());
        await result.current({ G: 3, H: 2 });
        expect(dispatch).toHaveBeenCalledWith({ type: GroupsActionType.REORDER, groups: { G: 3, H: 2 } });
        expect(request).toHaveBeenCalledWith(ApiUrl.GroupsReorder, { groups: { G: 3, H: 2 } });
    });

    it('does not call reorder action with empty group set', async () => {
        const { result } = renderHook(() => useReorderGroups(), withReduxState());
        await result.current({});
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
