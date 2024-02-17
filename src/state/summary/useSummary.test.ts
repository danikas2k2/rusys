import { renderHook } from '@testing-library/react';
import { getTestSummary } from '~/tests/fixtures';
import { useSummary } from '~/state/summary/useSummary';
import { withReduxState } from '~/tests/withReduxState';

describe('useSummary', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useSummary(), withReduxState());
        expect(result.current).toEqual([]);
    });

    it('return filled state', () => {
        const summary = getTestSummary();
        const { result } = renderHook(() => useSummary(), withReduxState({ summary }));
        expect(result.current).toEqual(summary);
    });
});
