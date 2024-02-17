import { renderHook } from '@testing-library/react';
import { getTestVariants } from '~/tests/fixtures';
import { type WithVariantsState } from '~/state/variants/types';
import { useAllVariants } from '~/state/variants/useAllVariants';
import { withReduxState } from '~/tests/withReduxState';

describe('useAllVariants', () => {
    const state: WithVariantsState = {
        variants: getTestVariants(),
    };

    it('returns list of all variants', async () => {
        const { result } = renderHook(() => useAllVariants(''), withReduxState(state));
        expect(result.current).toEqual(['', 'd', 'm', 'e', 'x']);
    });

    it('returns list of all variants of different group', async () => {
        const { result } = renderHook(() => useAllVariants('G'), withReduxState(state));
        expect(result.current).toEqual(['d', '', 'm', '1', 'x']);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useAllVariants('H'), withReduxState(state));
        expect(result.current).toEqual([]);
    });
});
