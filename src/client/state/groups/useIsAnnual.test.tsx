import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useIsAnnual } from '~/client/state/groups/useIsAnnual';
import type { Group } from '~/types/data';

describe('useIsAnnual', () => {
    const groups: Group[] = [
        { group: 'Uogienės', order: 1, annual: true },
        { group: 'Daržovės', order: 2, annual: false },
    ];

    it('returns true when group is found with annual: true', () => {
        const { result } = renderHook(() => useIsAnnual('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(true);
    });

    it('returns false when group is found with annual: false', () => {
        const { result } = renderHook(() => useIsAnnual('Daržovės'), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(false);
    });

    it('returns true (default) when group is not in the state', () => {
        const { result } = renderHook(() => useIsAnnual('Unknown'), {
            wrapper: ({ children }) => <MockRedux state={{ groups }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(true);
    });

    it('returns true (default) when state.groups is undefined', () => {
        const { result } = renderHook(() => useIsAnnual('Uogienės'), { wrapper: MockRedux });

        expect(result.current).toBe(true);
    });

    it('returns true (default) when state.groups is empty', () => {
        const { result } = renderHook(() => useIsAnnual('Uogienės'), {
            wrapper: ({ children }) => <MockRedux state={{ groups: [] }}>{children}</MockRedux>,
        });

        expect(result.current).toBe(true);
    });
});
