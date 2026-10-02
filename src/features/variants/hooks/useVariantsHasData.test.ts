import { renderHook } from '@testing-library/react';

import { useVariantsHasData } from '~/features/variants/hooks/useVariantsHasData';
import { useGroups } from '~/store/groups';
import { useVariants } from '~/store/variants';

vi.mock(import('~/store/groups/useGroups'));
vi.mock(import('~/store/variants/useVariants'));

describe('useVariantsHasData', () => {
    it('returns true if has all required Variants data', () => {
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBe(true);
    });

    it('returns false if has no groups', () => {
        vi.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBe(false);
    });

    it('returns false if has no variants', () => {
        vi.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBe(false);
    });
});
