import { renderHook } from '@testing-library/react';

import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useDetails } from '~/client/state/details/useDetails';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/state/variants/useVariants');
jest.mock('~/client/state/details/useDetails');

describe('useDetailsHasData', () => {
    it('returns true if has all required details data', () => {
        const { result } = renderHook(() => useDetailsHasData());

        expect(result.current).toBeTrue();
    });

    it('returns false if has no years', () => {
        jest.mocked(useYears).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no groups', () => {
        jest.mocked(useGroups).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        jest.mocked(useVariants).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());

        expect(result.current).toBeFalse();
    });

    it('returns false if has no details', () => {
        jest.mocked(useDetails).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());

        expect(result.current).toBeFalse();
    });
});
