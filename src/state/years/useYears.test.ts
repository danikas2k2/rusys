import { renderHook } from '@testing-library/react';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

describe('useYears', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useYears(), withReduxState());
        expect(result.current).toEqual([]);
    });

    it('return filled state', () => {
        const years: number[] = [21, 22, 23];
        const { result } = renderHook(() => useYears(), withReduxState({ years }));
        expect(result.current).toEqual(years);
    });
});
