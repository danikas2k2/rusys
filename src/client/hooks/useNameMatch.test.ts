import { renderHook } from '@testing-library/react';
import { useNameMatch } from '~/client/hooks/useNameMatch';
import { useDetails } from '~/state/details/useDetails';

jest.mock('~/state/details/useDetails');

describe('useNameMatch', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns true when name and group match', () => {
        const { result } = renderHook(() => useNameMatch('G', 'A'));
        expect(result.current).toBeTrue();
    });

    it('returns false when name does not match', () => {
        const { result } = renderHook(() => useNameMatch('G', 'Z'));
        expect(result.current).toBeFalse();
    });

    it('returns false when group does not match', () => {
        const { result } = renderHook(() => useNameMatch('H', 'A'));
        expect(result.current).toBeFalse();
    });

    it('is case insensitive for name and group', () => {
        const { result } = renderHook(() => useNameMatch('g', 'c'));
        expect(result.current).toBeTrue();
    });

    it('ignores leading and trailing spaces for name and group', () => {
        const { result } = renderHook(() => useNameMatch('  g  ', '  A  '));
        expect(result.current).toBeTrue();
    });

    it('returns false when there are no details', () => {
        (useDetails as jest.Mock).mockReturnValueOnce(undefined);
        const { result } = renderHook(() => useNameMatch('G', 'A'));
        expect(result.current).toBeFalse();
    });
});
