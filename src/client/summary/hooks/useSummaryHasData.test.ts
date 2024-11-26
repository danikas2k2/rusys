import { renderHook } from '@testing-library/react';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';
import { useGroups } from '~/state/groups/useGroups';
import { useSummary } from '~/state/summary/useSummary';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';

jest.mock('~/state/years/useYears');
jest.mock('~/state/groups/useGroups');
jest.mock('~/state/variants/useVariants');
jest.mock('~/state/summary/useSummary');

describe('useSummaryHasData', () => {
    it('returns true if has all required summary data', () => {
        const { result } = renderHook(() => useSummaryHasData());
        expect(result.current).toBeTrue();
    });

    it('returns false if has no years', () => {
        (useYears as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no groups', () => {
        (useGroups as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        (useVariants as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no summary', () => {
        (useSummary as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());
        expect(result.current).toBeFalse();
    });
});
