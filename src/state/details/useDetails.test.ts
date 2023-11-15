import { renderHook } from '@testing-library/react';
import { type AmountSet } from '~/state/details/types';
import { useDetails } from '~/state/details/useDetails';
import { withReduxState } from '~/tests/withReduxState';

describe('useDetails', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useDetails(), withReduxState());
        expect(result.current).toEqual({});
    });

    it('return filled state', () => {
        const details: AmountSet = { G: { A: { 21: { '': 1 }, 22: { '': 2, d: 3 } } } };
        const { result } = renderHook(() => useDetails(), withReduxState({ details }));
        expect(result.current).toEqual(details);
    });
});
