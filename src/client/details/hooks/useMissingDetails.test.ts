import { renderHook } from '@testing-library/react';
import { useMissingDetails } from '~/client/details/hooks/useMissingDetails';
import { getDetailsFixture } from '~/tests/fixtures';

describe('useMissingDetails', () => {
    it('returns nothing for empty list', () => {
        const { result } = renderHook(() => useMissingDetails([]));
        expect(result.current).toEqual([]);
    });

    const details = getDetailsFixture();

    it('returns nothing if no missing items in the list', () => {
        const { result } = renderHook(() => useMissingDetails(details.slice(2)));
        expect(result.current).toEqual([]);
    });

    it('returns missing items', () => {
        const { result } = renderHook(() => useMissingDetails(details));
        expect(result.current).toEqual([details[1]]);
    });
});
