import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';

import { useMissingDetails } from '~/client/app/details/hooks/useMissingDetails';

describe('useMissingDetails', () => {
    it('returns nothing for empty list', () => {
        const { result } = renderHook(() => useMissingDetails([]));

        expect(result.current).toStrictEqual([]);
    });

    const details = getDetailsFixture();

    it('returns nothing if no missing items in the list', () => {
        const { result } = renderHook(() => useMissingDetails(details.slice(2)));

        expect(result.current).toStrictEqual([]);
    });

    it('returns missing items', () => {
        const { result } = renderHook(() => useMissingDetails(details));

        expect(result.current).toStrictEqual([details[1]]);
    });
});
