import { renderHook } from '@testing-library/react';
import { getTestDetails } from '~/tests/fixtures';
import { useHasMissing } from '~/state/details/useHasMissing';
import { withReduxState } from '~/tests/withReduxState';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), withReduxState());
        expect(result.current).toBeFalse();
    });

    it('return true for filled state', () => {
        const details = getTestDetails();
        const { result } = renderHook(() => useHasMissing(), withReduxState({ details }));
        expect(result.current).toBeTrue();
    });
});
