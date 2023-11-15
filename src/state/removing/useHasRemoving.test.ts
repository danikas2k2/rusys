import { renderHook } from '@testing-library/react';
import { type RemovingSet } from '~/state/removing/types';
import { useHasRemoving } from '~/state/removing/useHasRemoving';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');

describe('useHasRemoving', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'A'), withReduxState());
        expect(result.current).toBeFalse();
    });

    const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
    it('return true for filled state', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'A'), withReduxState({ removing }));
        expect(result.current).toBeTrue();
    });

    it('return false for mismatched years', () => {
        (useYears as jest.Mock).mockReturnValueOnce([18, 19]);
        const { result } = renderHook(() => useHasRemoving('G', 'A'), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });

    it('return false for missing name', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'B'), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });

    it('return false for missing group', () => {
        const { result } = renderHook(() => useHasRemoving('H', 'A'), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });
});
