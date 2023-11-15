import { renderHook } from '@testing-library/react';
import { type Google } from '~/state/google/types';
import { useGoogle } from '~/state/google/useGoogle';
import { withReduxState } from '~/tests/withReduxState';

describe('useGoogle', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGoogle(), withReduxState());
        expect(result.current).toEqual({});
    });

    it('return filled state', () => {
        const google: Google = { loading: false, clientId: '123' };
        const { result } = renderHook(() => useGoogle(), withReduxState({ google }));
        expect(result.current).toEqual(google);
    });
});
