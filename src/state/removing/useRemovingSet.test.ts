import { renderHook } from '@testing-library/react';
import { type RemovingSet } from '~/state/removing/types';
import { useRemovingSet } from '~/state/removing/useRemovingSet';
import { withReduxState } from '~/tests/withReduxState';

describe('useRemovingSet', () => {
    it('return empty set for empty state', () => {
        const { result } = renderHook(() => useRemovingSet('G', 'A'), withReduxState());
        expect(result.current).toEqual({});
    });

    const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
    it('return true for filled state', () => {
        const { result } = renderHook(() => useRemovingSet('G', 'A'), withReduxState({ removing }));
        expect(result.current).toEqual({ 21: true, 22: true });
    });

    it('return false for missing name', () => {
        const { result } = renderHook(() => useRemovingSet('G', 'B'), withReduxState({ removing }));
        expect(result.current).toEqual({});
    });

    it('return false for missing group', () => {
        const { result } = renderHook(() => useRemovingSet('H', 'A'), withReduxState({ removing }));
        expect(result.current).toEqual({});
    });
});
