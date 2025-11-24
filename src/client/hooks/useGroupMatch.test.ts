import { renderHook } from '@testing-library/react';

import { useGroupMatch } from '~/client/hooks/useGroupMatch';
import { useProducts } from '~/client/state/products/useProducts';

jest.mock('~/client/state/products/useProducts', () => ({
    useProducts: jest.fn().mockReturnValue({ Group: {}, Other: {} }),
}));

describe('useGroupMatch', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns true when group matches', () => {
        const { result } = renderHook(() => useGroupMatch('Group'));

        expect(result.current).toBeTrue();
    });

    it('returns false when group does not match', () => {
        const { result } = renderHook(() => useGroupMatch('Some'));

        expect(result.current).toBeFalse();
    });

    it('is case insensitive', () => {
        const { result } = renderHook(() => useGroupMatch('OTHER'));

        expect(result.current).toBeTrue();
    });

    it('ignores leading and trailing spaces', () => {
        const { result } = renderHook(() => useGroupMatch('  Group  '));

        expect(result.current).toBeTrue();
    });

    it('returns false when there are no products', () => {
        jest.mocked(useProducts).mockReturnValueOnce([]);
        const { result } = renderHook(() => useGroupMatch('Group'));

        expect(result.current).toBeFalse();
    });

    it('returns false when useProducts returns null', () => {
        jest.mocked(useProducts).mockReturnValueOnce(null as any);
        const { result } = renderHook(() => useGroupMatch('Group'));

        expect(result.current).toBe(false);
    });

    it('returns false when useProducts returns undefined', () => {
        jest.mocked(useProducts).mockReturnValueOnce(undefined as any);
        const { result } = renderHook(() => useGroupMatch('Group'));

        expect(result.current).toBe(false);
    });
});
