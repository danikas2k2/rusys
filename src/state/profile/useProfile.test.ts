import { renderHook } from '@testing-library/react';
import { useDev } from '~/common/hooks/useDev';
import { profile as reducer } from '~/state/profile/reducer';
import { type Profile } from '~/state/profile/types';
import { DEV_MODE_PROFILE, useProfile } from '~/state/profile/useProfile';
import { useSetProfile } from '~/state/profile/useSetProfile';
import { mockLocalStorage } from '~/tests/mockLocalStorage';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/common/hooks/useDev', () => ({
    useDev: jest.fn().mockReturnValue(false),
}));
jest.mock('~/state/profile/useSetProfile', () => ({
    useSetProfile: jest.fn(),
}));

describe('useProfile', () => {
    const setProfile = jest.fn();

    beforeAll(() => {
        (useSetProfile as jest.Mock).mockReturnValue(setProfile);
    });

    afterEach(() => jest.clearAllMocks());

    const value: Profile = {
        sub: '123',
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    const { getItem } = mockLocalStorage();

    it('return stored profile', () => {
        const { result } = renderHook(() => useProfile(), withReduxState({ profile: value }, { profile: reducer }));
        expect(result.current).toEqual(value);
        expect(getItem).not.toHaveBeenCalled();
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return empty profile for empty state', () => {
        const { result } = renderHook(() => useProfile(), withReduxState({}, { profile: reducer }));
        expect(result.current).toEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return profile from localStorage and store it to redux', () => {
        getItem.mockReturnValueOnce(JSON.stringify(value));
        const { result } = renderHook(() => useProfile(), withReduxState({}, { profile: reducer }));
        expect(result.current).toEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('return current profile if dev mode enabled but has profile', () => {
        (useDev as jest.Mock).mockReturnValue(true);
        const { result } = renderHook(() => useProfile(), withReduxState({ profile: value }, { profile: reducer }));
        expect(result.current).toEqual(value);
    });

    it('return profile from localStorage if dev mode enabled', () => {
        (useDev as jest.Mock).mockReturnValueOnce(true);
        getItem.mockReturnValueOnce(JSON.stringify(value));
        const { result } = renderHook(() => useProfile(), withReduxState({}, { profile: reducer }));
        expect(result.current).toEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('return dev profile if dev mode enabled and has no profile neither in state nor in localStorage', () => {
        (useDev as jest.Mock).mockReturnValueOnce(true);
        const { result } = renderHook(() => useProfile(), withReduxState({}, { profile: reducer }));
        expect(result.current).toEqual(DEV_MODE_PROFILE);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(DEV_MODE_PROFILE);
    });
});
