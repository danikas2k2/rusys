import { act, renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useSetProfile } from '~/components/user/hooks/useSetProfile';
import { setProfileAction } from '~/store/profile';

vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useSetProfile', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('dispatches setProfileAction with provided profile', () => {
        const { result } = renderHook(() => useSetProfile(), { wrapper: MockRedux });
        const profile = { name: 'Test User', email: 'test.user@email.com' };

        act(() => result.current(profile));

        expect(dispatch).toHaveBeenCalledWith(setProfileAction(profile));
    });
});
