import { renderHook } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { type WithVariantsState } from '~/state/variants/types';
import { useVariantComparator } from '~/state/variants/useVariantComparator';

describe('useVariantComparator', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns sorted variants', async () => {
        const { result } = renderHook(() => useVariantComparator(), withReduxState(state));

        expect(['x', 'd', 'm', 'p', 'e'].sort(result.current('Uogienės'))).toStrictEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns sorted variants for different group', async () => {
        const { result } = renderHook(() => useVariantComparator(), withReduxState(state));

        expect(['1', 'p', 'd', 'x', 'm'].sort(result.current('Daržovės'))).toStrictEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('leaves invalid variants at the end of list', async () => {
        const { result } = renderHook(() => useVariantComparator(), withReduxState(state));

        expect(['3', 'p', 'd', 'm', '1'].sort(result.current('Uogienės'))).toStrictEqual(['p', 'd', 'm', '3', '1']);
    });
});
