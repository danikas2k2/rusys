import { renderHook } from '@testing-library/react';

import { useSummaryHasData } from '~/features/summary/hooks/useSummaryHasData';
import { useGroups } from '~/store/groups';
import { useSummary } from '~/store/summary';
import { useVariants } from '~/store/variants';
import { useYears } from '~/store/years';

vi.mock(import('~/store/years/useYears'));
vi.mock(import('~/store/groups/useGroups'));
vi.mock(import('~/store/variants/useVariants'));
vi.mock(import('~/store/summary/useSummary'));

describe('useSummaryHasData', () => {
    it('returns true if has all required summary data', () => {
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBe(true);
    });

    it('returns false if has no years', () => {
        vi.mocked(useYears).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no groups', () => {
        vi.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no variants', () => {
        vi.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no summary', () => {
        vi.mocked(useSummary).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBe(false);
    });
});
