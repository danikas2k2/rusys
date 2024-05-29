import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '~/tests/fixtures';
import { type Details } from '~/common/types';
import { useDetails } from '~/state/details/useDetails';
import { withReduxState } from '~/tests/withReduxState';

describe('useDetails', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useDetails(), withReduxState());
        expect(result.current).toEqual([]);
    });

    it('return filled state', () => {
        const details: Details[] = getDetailsFixture();
        const { result } = renderHook(() => useDetails(), withReduxState({ details }));
        expect(result.current).toEqual(details);
    });
});
