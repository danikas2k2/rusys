import { renderHook } from '@testing-library/react';
import { mockLocalStorage } from '@tests/mockLocalStorage';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isDevMode } from '~/common/utils/dev';
import { DEV_MODE_PROFILE } from '~/store/profile/dev';
import { profile as reducer } from '~/store/profile/reducer';
import type { Profile } from '~/store/profile/types';
import { useProfile } from '~/store/profile/useProfile';
import { useSetProfile } from '~/store/profile/useSetProfile';

vi.mock(import('~/common/utils/dev'), () => ({
    isDevMode: vi.fn().mockReturnValue(false),
}));
vi.mock(import('~/store/profile/useSetProfile'), () => ({
    useSetProfile: vi.fn(),
}));

describe('useProfile', () => {
    const setProfile = vi.fn();

    beforeAll(() => {
        vi.mocked(useSetProfile).mockReturnValue(setProfile);
    });

    afterEach(() => vi.clearAllMocks());

    const value: Profile = {
        sub: '123',
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    const { getItem } = mockLocalStorage();

    it('returns stored profile', () => {
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ profile: value }} reducers={{ profile: reducer }}>
                    {children}
                </MockRedux>
            ),
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('returns empty profile for empty state', () => {
        const { result } = renderHook(() => useProfile(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('returns empty profile from localStorage if not defined', () => {
        getItem.mockReturnValueOnce(null);

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('returns empty profile from localStorage if invalid', () => {
        getItem.mockReturnValueOnce('null');

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual({});
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).not.toHaveBeenCalled();
    });

    it('returns profile from localStorage and store it to redux', () => {
        getItem.mockReturnValueOnce(JSON.stringify(value));

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('returns current profile if dev mode enabled but has profile', () => {
        vi.mocked(isDevMode).mockReturnValue(true);

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ profile: value }} reducers={{ profile: reducer }}>
                    {children}
                </MockRedux>
            ),
        });

        expect(result.current).toStrictEqual(value);
    });

    it('returns profile from localStorage if dev mode enabled', () => {
        vi.mocked(isDevMode).mockReturnValueOnce(true);
        getItem.mockReturnValueOnce(JSON.stringify(value));

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(value);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(value);
    });

    it('returns dev profile if dev mode enabled and has no profile neither in state nor in localStorage', () => {
        vi.mocked(isDevMode).mockReturnValueOnce(true);

        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => <MockRedux reducers={{ profile: reducer }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(DEV_MODE_PROFILE);
        expect(getItem).toHaveBeenCalledWith('profile');
        expect(setProfile).toHaveBeenCalledWith(DEV_MODE_PROFILE);
    });
});
