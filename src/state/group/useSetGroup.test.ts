import { useDispatch } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { GroupActionType } from '~/state/group/actions';
import { useSetGroup } from '~/state/group/useSetGroup';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetGroup', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('calls set group action', () => {
        const { result } = renderHook(() => useSetGroup(), withReduxState());
        result.current('grouped');

        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.SET, group: 'grouped' });
    });

    it('calls set group action with empty value', () => {
        const { result } = renderHook(() => useSetGroup(), withReduxState());
        result.current('');

        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.SET, group: '' });
    });
});
