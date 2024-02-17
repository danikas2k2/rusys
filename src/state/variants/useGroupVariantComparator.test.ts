import { renderHook } from '@testing-library/react';
import { getTestVariants } from '~/tests/fixtures';
import type { WithVariantsState } from '~/state/variants/types';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import { withReduxState } from '~/tests/withReduxState';

describe('useGroupVariantComparator', () => {
    const state: WithVariantsState = {
        variants: getTestVariants(),
    };

    it('returns sorted variants', async () => {
        const { result } = renderHook(() => useGroupVariantComparator(''), withReduxState(state));
        expect(['x', 'd', 'm', '', 'e'].sort(result.current)).toEqual(['', 'd', 'm', 'e', 'x']);
    });

    it('returns sorted variants for different group', async () => {
        const { result } = renderHook(() => useGroupVariantComparator('G'), withReduxState(state));
        expect(['1', '', 'd', 'x', 'm'].sort(result.current)).toEqual(['d', '', 'm', '1', 'x']);
    });

    it('leaves invalid variants at the end of list', async () => {
        const { result } = renderHook(() => useGroupVariantComparator(''), withReduxState(state));
        expect(['1', '', 'x', 'd', 'm', '3', '2'].sort(result.current)).toEqual(['', 'd', 'm', 'x', '1', '3', '2']);
    });
});
