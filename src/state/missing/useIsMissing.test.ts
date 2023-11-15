import { renderHook } from '@testing-library/react';
import { useIsMissing } from '~/state/missing/useIsMissing';
import { withReduxState } from '~/tests/withReduxState';

describe('useIsMissing', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useIsMissing(), withReduxState());
        expect(result.current('G', 'A')).toBeFalse();
    });

    it('return true for filled state', () => {
        const { result } = renderHook(
            () => useIsMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        expect(result.current('G', 'A')).toBeTrue();
    });

    it('return false if name not found', () => {
        const { result } = renderHook(
            () => useIsMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        expect(result.current('G', 'B')).toBeFalse();
    });

    it('return false if group not found', () => {
        const { result } = renderHook(
            () => useIsMissing(),
            withReduxState({
                missing: [{ group: 'G', name: 'A' }],
            })
        );
        expect(result.current('H', 'A')).toBeFalse();
    });
});
