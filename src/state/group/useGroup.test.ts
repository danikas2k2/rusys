import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { useGroup } from '~/state/group/useGroup';

describe('useGroup', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGroup(), withReduxState());

        expect(result.current).toBe('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useGroup(), withReduxState({ group: 'grouped' }));

        expect(result.current).toBe('grouped');
    });
});
