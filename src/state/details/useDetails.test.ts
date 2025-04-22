import { renderHook } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { type Details } from '~/common/types';
import { useDetails } from '~/state/details/useDetails';

describe('useDetails', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useDetails(), withReduxState());

        expect(result.current).toStrictEqual([]);
    });

    it('return filled state', () => {
        const details: Details[] = getDetailsFixture();
        const { result } = renderHook(() => useDetails(), withReduxState({ details }));

        expect(result.current).toStrictEqual(details);
    });
});
