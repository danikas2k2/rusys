import { renderHook } from '@testing-library/react';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

describe('useUniqueGroups', () => {
    const state = { groups: getGroupsFixture() };

    it('returns unique groups from variants', () => {
        const { result } = renderHook(() => useUniqueGroups(getVariantsFixture()), withReduxState(state));
        expect(result.current).toEqual(['Uogienės', 'Daržovės']);
    });

    it('returns unique groups from details', () => {
        const { result } = renderHook(() => useUniqueGroups(getDetailsFixture()), withReduxState(state));
        expect(result.current).toEqual(['Uogienės', 'Daržovės']);
    });

    it('returns empty group list for empty list', () => {
        const { result } = renderHook(() => useUniqueGroups([]), withReduxState(state));
        expect(result.current).toEqual([]);
    });
});
