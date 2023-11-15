import { renderHook } from '@testing-library/react';
import { useHasMissing } from '~/state/missing/useHasMissing';
import { withReduxState } from '~/tests/withReduxState';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), withReduxState());
        expect(result.current).toBeFalse();
    });

    it('return true for filled state', () => {
        const { result } = renderHook(
            () => useHasMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        expect(result.current).toBeTrue();
    });
});
