import { renderHook } from '@testing-library/react';
import { useNameMatch } from '~/client/hooks/useNameMatch';
import { useDetails } from '~/state/details/useDetails';

jest.mock('~/state/details/useDetails', () => ({
    useDetails: jest.fn().mockReturnValue({ Group: { First: {}, Second: {} }, Other: { First: {} } }),
}));

describe('useNameMatch', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns true when name and group match', () => {
        const { result } = renderHook(() => useNameMatch('Group', 'First'));
        expect(result.current).toBeTrue();
    });

    it('returns false when name does not match', () => {
        const { result } = renderHook(() => useNameMatch('Group', 'Some'));
        expect(result.current).toBeFalse();
    });

    it('returns false when group does not match', () => {
        const { result } = renderHook(() => useNameMatch('Some', 'First'));
        expect(result.current).toBeFalse();
    });

    it('is case insensitive for name and group', () => {
        const { result } = renderHook(() => useNameMatch('OTHER', 'FIRST'));
        expect(result.current).toBeTrue();
    });

    it('ignores leading and trailing spaces for name and group', () => {
        const { result } = renderHook(() => useNameMatch('  Group  ', '  Second  '));
        expect(result.current).toBeTrue();
    });

    it('returns false when there are no details', () => {
        (useDetails as jest.Mock).mockReturnValueOnce(undefined);
        const { result } = renderHook(() => useNameMatch('Group', 'First'));
        expect(result.current).toBeFalse();
    });
});
