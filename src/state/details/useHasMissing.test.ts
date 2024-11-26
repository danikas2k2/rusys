import { renderHook } from '@testing-library/react';
import { useHasMissing } from '~/state/details/useHasMissing';
import { getDetailsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

describe('useHasMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasMissing(), withReduxState());
        expect(result.current).toBeFalse();
    });

    it('return true for filled state', () => {
        const details = getDetailsFixture();
        const { result } = renderHook(() => useHasMissing(), withReduxState({ details }));
        expect(result.current).toBeTrue();
    });
});
