import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { isDevMode } from '~/common/utils/dev';
import { DEV_MODE_PROFILE } from './dev';
import { profile as reducer } from './slice';
import { useProfile } from './useProfile';

vi.mock(import('~/common/utils/dev'), () => ({ isDevMode: vi.fn().mockReturnValue(false) }));

describe('useProfile', () => {
    afterEach(() => vi.clearAllMocks());

    it('uses the server-preloaded Redux profile', () => {
        const value = { sub: '123', email: 'user@example.com', allowed: true };
        const { result } = renderHook(() => useProfile(), {
            wrapper: ({ children }) => (
                <MockRedux state={{ profile: value }} reducers={{ profile: reducer }}>
                    {children}
                </MockRedux>
            ),
        });

        expect(result.current).toStrictEqual(value);
    });

    it('does not trust a localStorage profile without a server session', () => {
        localStorage.setItem('profile', JSON.stringify({ sub: 'forged', allowed: true }));
        const { result } = renderHook(() => useProfile(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual({});

        localStorage.removeItem('profile');
    });

    it('uses the development profile in development mode', () => {
        vi.mocked(isDevMode).mockReturnValue(true);
        const { result } = renderHook(() => useProfile(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual({ ...DEV_MODE_PROFILE, allowed: true });
    });
});
