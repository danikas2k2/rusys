import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { resetProfileAction } from '~/state/profile/actions';
import { useResetProfile } from '~/state/profile/useResetProfile';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useResetProfile', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('dispatches resetProfileAction', () => {
        const { result } = renderHook(() => useResetProfile(), withReduxState());

        act(() => result.current());

        expect(dispatch).toHaveBeenCalledWith(resetProfileAction());
    });
});
