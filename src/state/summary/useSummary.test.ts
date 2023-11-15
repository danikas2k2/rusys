import { renderHook } from '@testing-library/react';
import { type AmountSet } from '~/state/details/types';
import { useSummary } from '~/state/summary/useSummary';
import { withReduxState } from '~/tests/withReduxState';

describe('useSummary', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useSummary(), withReduxState());
        expect(result.current).toEqual({});
    });

    it('return filled state', () => {
        const summary: AmountSet = { G: { A: { 21: { '': 1 }, 22: { '': 2, d: 3 } } } };
        const { result } = renderHook(() => useSummary(), withReduxState({ summary }));
        expect(result.current).toEqual(summary);
    });
});
