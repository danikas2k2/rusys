import { renderHook } from '@testing-library/react';
import { useMissing } from '~/state/missing/useMissing';
import { withReduxState } from '~/tests/withReduxState';

describe('useMissing', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useMissing(), withReduxState());
        expect(result.current).toEqual([]);
    });

    it('return filled state', () => {
        const missing = [{ group: 'G', name: 'A' }];
        const { result } = renderHook(() => useMissing(), withReduxState({ missing }));
        expect(result.current).toEqual(missing);
    });
});
