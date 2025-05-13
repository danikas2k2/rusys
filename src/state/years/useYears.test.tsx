import React from 'react';
import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useYears } from '~/state/years/useYears';

describe('useYears', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useYears(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const years: number[] = [21, 22, 23];
        const { result } = renderHook(() => useYears(), {
            wrapper: ({ children }) => <MockRedux state={{ years }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(years);
    });
});
