import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useYears } from '~/state/years/useYears';

jest.mock('~/state/years/useYears');

describe('useHasRemoving', () => {
    it('return false for empty state', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'C'), withReduxState());

        expect(result.current).toBeFalse();
    });

    const details = getDetailsFixture();

    it('return true for filled state', () => {
        const { result } = renderHook(() => useHasRemoving('Daržovės', 'Kopūstai'), withReduxState({ details }));

        expect(result.current).toBeTrue();
    });

    it('return false for mismatched years', () => {
        jest.mocked(useYears).mockReturnValueOnce([18, 19]);
        const { result } = renderHook(() => useHasRemoving('G', 'C'), withReduxState({ details }));

        expect(result.current).toBeFalse();
    });

    it('return false for missing name', () => {
        const { result } = renderHook(() => useHasRemoving('G', 'B'), withReduxState({ details }));

        expect(result.current).toBeFalse();
    });

    it('return false for missing group', () => {
        const { result } = renderHook(() => useHasRemoving('H', 'C'), withReduxState({ details }));

        expect(result.current).toBeFalse();
    });
});
