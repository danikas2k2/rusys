import { renderHook } from '@testing-library/react';
import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useGroups } from '~/state/groups/useGroups';
import { useDetails } from '~/state/details/useDetails';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';

jest.mock('~/state/years/useYears');
jest.mock('~/state/groups/useGroups');
jest.mock('~/state/variants/useVariants');
jest.mock('~/state/details/useDetails');

describe('useDetailsHasData', () => {
    it('returns true if has all required details data', () => {
        const { result } = renderHook(() => useDetailsHasData());
        expect(result.current).toBeTrue();
    });

    it('returns false if has no years', () => {
        (useYears as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no groups', () => {
        (useGroups as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no variants', () => {
        (useVariants as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());
        expect(result.current).toBeFalse();
    });

    it('returns false if has no details', () => {
        (useDetails as jest.Mock).mockReturnValueOnce([]);
        const { result } = renderHook(() => useDetailsHasData());
        expect(result.current).toBeFalse();
    });
});
