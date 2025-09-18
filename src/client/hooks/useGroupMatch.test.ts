import { renderHook } from '@testing-library/react';

import { useGroupMatch } from '~/client/hooks/useGroupMatch';
import { useDetails } from '~/state/details/useDetails';

jest.mock('~/state/details/useDetails', () => ({
    useDetails: jest.fn().mockReturnValue({ Group: {}, Other: {} }),
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

    it('returns false when there are no details', () => {
        jest.mocked(useDetails).mockReturnValueOnce([]);
        const { result } = renderHook(() => useGroupMatch('Group'));

        expect(result.current).toBeFalse();
    });
});
