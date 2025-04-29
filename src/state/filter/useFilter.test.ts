import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { useFilter } from '~/state/filter/useFilter';

describe('useFilter', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useFilter(), withReduxState());

        expect(result.current).toBe('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useFilter(), withReduxState({ filter: 'filtered' }));

        expect(result.current).toBe('filtered');
    });
});
