import { renderHook } from '@testing-library/react';

import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';

vi.mock('~/client/state/groups/useGroups');
vi.mock('~/client/state/variants/useVariants');

describe('useVariantsHasData', () => {
    it('returns true if has all required Variants data', () => {
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false if has no groups', () => {
        vi.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        vi.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeFalse();
    });
});
