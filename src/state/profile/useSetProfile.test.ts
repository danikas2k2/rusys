import { useDispatch } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { setProfileAction } from '~/state/profile/actions';
import { useSetProfile } from '~/state/profile/useSetProfile';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetProfile', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('dispatches setProfileAction with provided profile', () => {
        const { result } = renderHook(() => useSetProfile(), withReduxState());
        const profile = { name: 'Test User', email: 'test.user@email.com' };

        act(() => result.current(profile));

        expect(dispatch).toHaveBeenCalledWith(setProfileAction(profile));
    });
});
