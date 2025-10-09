import { renderHook } from '@testing-library/react';

import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';
import { useVariantsHasData } from '~/client/variants/hooks/useVariantsHasData';

jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/state/variants/useVariants');

describe('useVariantsHasData', () => {
    it('returns true if has all required Variants data', () => {
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false if has no groups', () => {
        jest.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        jest.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useVariantsHasData());

        expect(result.current).toBeFalse();
    });
});
