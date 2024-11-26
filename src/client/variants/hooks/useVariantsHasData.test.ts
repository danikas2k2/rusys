import { renderHook } from '@testing-library/react';
import { useVariantsHasData } from '~/client/variants/hooks/useVariantsHasData';
import { useGroups } from '~/state/groups/useGroups';
import { useVariants } from '~/state/variants/useVariants';

jest.mock('~/state/groups/useGroups');
jest.mock('~/state/variants/useVariants');

describe('useVariantsHasData', () => {
    it('returns true if has all required Variants data', () => {
        const { result } = renderHook(() => useVariantsHasData());
        expect(result.current).toBeTrue();
    });

    it('returns false if has no groups', () => {
        (useGroups as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        (useVariants as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());
        expect(result.current).toBeFalse();
    });
});
