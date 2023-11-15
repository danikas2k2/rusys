import { renderHook } from '@testing-library/react';
import { type RemovingSet } from '~/state/removing/types';
import { useRemoving } from '~/state/removing/useRemoving';
import { withReduxState } from '~/tests/withReduxState';

describe('useRemoving', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useRemoving(), withReduxState());
        expect(result.current).toEqual({});
    });

    it('return filled state', () => {
        const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
        const { result } = renderHook(() => useRemoving(), withReduxState({ removing }));
        expect(result.current).toEqual(removing);
    });
});
