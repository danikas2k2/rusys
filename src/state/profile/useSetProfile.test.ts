import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { setProfileAction } from '~/state/profile/actions';
import { useSetProfile } from '~/state/profile/useSetProfile';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetProfile', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('dispatches setProfileAction with provided profile', () => {
        const { result } = renderHook(() => useSetProfile(), withReduxState());
        const profile = { name: 'Test User', email: 'test.user@email.com' };

        act(() => result.current(profile));

        expect(dispatch).toHaveBeenCalledWith(setProfileAction(profile));
    });
});
