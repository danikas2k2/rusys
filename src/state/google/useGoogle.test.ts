import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { type Google } from '~/state/google/types';
import { useGoogle } from '~/state/google/useGoogle';

describe('useGoogle', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useGoogle(), withReduxState());

        expect(result.current).toStrictEqual({});
    });

    it('return filled state', () => {
        const google: Google = { loading: false, clientId: '123' };
        const { result } = renderHook(() => useGoogle(), withReduxState({ google }));

        expect(result.current).toStrictEqual(google);
    });
});
