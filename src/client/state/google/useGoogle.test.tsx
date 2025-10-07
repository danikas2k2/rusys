import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { type Google } from '~/client/state/google/types';
import { useGoogle } from '~/client/state/google/useGoogle';

describe('useGoogle', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGoogle(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual({});
    });

    it('return filled state', () => {
        const google: Google = { loading: false, clientId: '123' };
        const { result } = renderHook(() => useGoogle(), {
            wrapper: ({ children }) => <MockRedux state={{ google }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(google);
    });
});
