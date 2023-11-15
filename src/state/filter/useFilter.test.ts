import { renderHook } from '@testing-library/react';
import { useFilter } from '~/state/filter/useFilter';
import { withReduxState } from '~/tests/withReduxState';

describe('useFilter', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useFilter(), withReduxState());
        expect(result.current).toEqual('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useFilter(), withReduxState({ filter: 'filtered' }));
        expect(result.current).toEqual('filtered');
    });
});
