import { renderHook } from '@testing-library/react';
import { type WithVariantsState } from '~/state/variants/types';
import { useAllVariants } from '~/state/variants/useAllVariants';
import { getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

describe('useAllVariants', () => {
    const state: WithVariantsState = {
        variants: getVariantsFixture(),
    };

    it('returns list of all variants', async () => {
        const { result } = renderHook(() => useAllVariants('Uogienės'), withReduxState(state));
        expect(result.current).toEqual(['p', 'd', 'm', 'e', 'x']);
    });

    it('returns list of all variants of different group', async () => {
        const { result } = renderHook(() => useAllVariants('Daržovės'), withReduxState(state));
        expect(result.current).toEqual(['d', 'p', 'm', '1', 'x']);
    });

    it('returns empty list if group does not exist', async () => {
        const { result } = renderHook(() => useAllVariants('Skalbikliai'), withReduxState(state));
        expect(result.current).toEqual([]);
    });
});
