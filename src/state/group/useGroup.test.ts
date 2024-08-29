import { renderHook } from '@testing-library/react';
import { useGroup } from '~/state/group/useGroup';
import { withReduxState } from '~/tests/withReduxState';

describe('useGroup', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGroup(), withReduxState());
        expect(result.current).toEqual('');
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useGroup(), withReduxState({ group: 'grouped' }));
        expect(result.current).toEqual('grouped');
    });
});
