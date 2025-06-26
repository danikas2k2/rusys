import React from 'react';
import { renderHook } from '@testing-library/react';
import { mockLocalStorage } from '@tests/mockLocalStorage';
import { MockRedux } from '@tests/MockRedux';
import { isDevMode } from '~/common/utils/env';
import { DEV_MODE_PROFILE } from '~/state/profile/dev';
import { profile as reducer } from '~/state/profile/reducer';
import { type Profile } from '~/state/profile/types';
import { useProfile } from '~/state/profile/useProfile';
import { useSetProfile } from '~/state/profile/useSetProfile';

jest.mock('~/common/utils/env', () => ({
    isDevMode: jest.fn().mockReturnValue(false),
}));
jest.mock('~/state/profile/useSetProfile', () => ({
    useSetProfile: jest.fn(),
}));

describe('useProfile', () => {
    const setProfile = jest.fn();

    beforeAll(() => jest.mocked(useSetProfile).mockReturnValue(setProfile));

    afterEach(() => jest.clearAllMocks());

    const value: Profile = {
        sub: '123',
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    const { getItem } = mockLocalStorage();

    it('return stored profile', () => {
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ profile: value }} reducers={{ profile: reducer }}>
                    {children}
                </MockRedux>
            ),
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).not.toHaveBeenCalled();
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return empty profile for empty state', () => {
        const { result } = renderHook(() => useProfile(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return empty profile from localStorage if not defined', () => {
        getItem.mockReturnValueOnce(null);
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return empty profile from localStorage if invalid', () => {
        getItem.mockReturnValueOnce('null');
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('return profile from localStorage and store it to redux', () => {
        getItem.mockReturnValueOnce(JSON.stringify(value));
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('return current profile if dev mode enabled but has profile', () => {
        jest.mocked(isDevMode).mockReturnValue(true);
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ profile: value }} reducers={{ profile: reducer }}>
                    {children}
                </MockRedux>
            ),
        });

        expect(result.current).toStrictEqual(value);
    });

    it('return profile from localStorage if dev mode enabled', () => {
        jest.mocked(isDevMode).mockReturnValueOnce(true);
        getItem.mockReturnValueOnce(JSON.stringify(value));
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('return dev profile if dev mode enabled and has no profile neither in state nor in localStorage', () => {
        jest.mocked(isDevMode).mockReturnValueOnce(true);
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(DEV_MODE_PROFILE);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(DEV_MODE_PROFILE);
    });
});
