import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { useSummary } from '~/state/summary/useSummary';

describe('useSummary', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useSummary(), withReduxState());

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const summary = getSummaryFixture();
        const { result } = renderHook(() => useSummary(), withReduxState({ summary }));

        expect(result.current).toStrictEqual(summary);
    });
});
