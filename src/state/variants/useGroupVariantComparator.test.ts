import { renderHook } from '@testing-library/react';
import type { WithVariantsState } from '~/state/variants/types';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import { getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

describe('useGroupVariantComparator', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns sorted variants', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('J'), withReduxState(state));
        expect(['x', 'd', 'm', 'p', 'e'].sort(result.current)).toEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns sorted variants for different group', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('G'), withReduxState(state));
        expect(['1', 'p', 'd', 'x', 'm'].sort(result.current)).toEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('leaves invalid variants at the end of list', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('J'), withReduxState(state));
        expect(['1', 'p', 'd', 'm', '3', '2'].sort(result.current)).toEqual(['p', 'd', 'm', '1', '3', '2']);
    });
});
