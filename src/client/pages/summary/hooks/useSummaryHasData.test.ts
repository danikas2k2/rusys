import { renderHook } from '@testing-library/react';

import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useGroups } from '~/client/state/groups/useGroups';
import { useSummary } from '~/client/state/summary/useSummary';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/state/groups/useGroups'));
vi.mock(import('~/client/state/variants/useVariants'));
vi.mock(import('~/client/state/summary/useSummary'));

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
