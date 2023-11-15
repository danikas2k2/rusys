import { renderHook } from '@testing-library/react';
import { type RemovingSet } from '~/state/removing/types';
import { useIsRemoving } from '~/state/removing/useIsRemoving';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');

describe('useIsRemoving', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useIsRemoving('G', 'A', 21), withReduxState());
        expect(result.current).toBeFalse();
    });

    const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
    it('return true for filled state', () => {
        const { result } = renderHook(() => useIsRemoving('G', 'A', 21), withReduxState({ removing }));
        expect(result.current).toBeTrue();
    });

    it('return false for mismatched years', () => {
        (useYears as jest.Mock).mockReturnValueOnce([18, 19]);
        const { result } = renderHook(() => useIsRemoving('G', 'A', 21), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });

    it('return false for missing year', () => {
        const { result } = renderHook(() => useIsRemoving('G', 'A', 20), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });

    it('return false for missing name', () => {
        const { result } = renderHook(() => useIsRemoving('G', 'B', 21), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });

    it('return false for missing group', () => {
        const { result } = renderHook(() => useIsRemoving('H', 'A', 21), withReduxState({ removing }));
        expect(result.current).toBeFalse();
    });
});
