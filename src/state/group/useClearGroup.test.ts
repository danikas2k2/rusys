import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { GroupActionType } from '~/state/group/actions';
import { useClearGroup } from '~/state/group/useClearGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useClearGroup', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls set group action', async () => {
        const { result } = renderHook(() => useClearGroup(), withReduxState());
        await result.current();
        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.CLEAR });
    });
});
