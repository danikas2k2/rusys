import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useYears } from '~/store/years/useYears';

describe('useYears', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useYears(), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    it('return empty list for empty state with custom number of years', () => {
        const { result } = renderHook(() => useYears(3), { wrapper: MockRedux });

        expect(result.current).toStrictEqual([]);
    });

    const years: number[] = [25, 24, 23, 22, 21];

    it('return filled state', () => {
        const { result } = renderHook(() => useYears(), {
            wrapper: ({ children }) => <MockRedux state={{ years }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(years);
    });

    it('return custom number of years', () => {
        const { result } = renderHook(() => useYears(3), {
            wrapper: ({ children }) => <MockRedux state={{ years }}>{children}</MockRedux>,
        });

        expect(result.current).toStrictEqual(years.slice(0, 3));
    });
});
