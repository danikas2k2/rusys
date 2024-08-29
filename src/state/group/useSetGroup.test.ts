import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { GroupActionType } from '~/state/group/actions';
import { useSetGroup } from '~/state/group/useSetGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetGroup', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls set group action', async () => {
        const { result } = renderHook(() => useSetGroup(), withReduxState());
        await result.current('grouped');
        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.SET, group: 'grouped' });
    });

    it('calls set group action with empty value', async () => {
        const { result } = renderHook(() => useSetGroup(), withReduxState());
        await result.current('');
        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.SET, group: '' });
    });
});
