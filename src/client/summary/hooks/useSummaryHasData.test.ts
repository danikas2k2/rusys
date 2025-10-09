import { renderHook } from '@testing-library/react';

import { useGroups } from '~/client/state/groups/useGroups';
import { useSummary } from '~/client/state/summary/useSummary';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/state/variants/useVariants');
jest.mock('~/client/state/summary/useSummary');

describe('useSummaryHasData', () => {
    it('returns true if has all required summary data', () => {
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false if has no years', () => {
        jest.mocked(useYears).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no groups', () => {
        jest.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        jest.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no summary', () => {
        jest.mocked(useSummary).mockReturnValueOnce([]);
        const { result } = renderHook(() => useSummaryHasData());

        expect(result.current).toBeFalse();
    });
});
