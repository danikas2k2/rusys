import { renderHook } from '@testing-library/react';

import { useSummary } from '~/store/summary';
import { useGroupsWithSummary } from './useGroupsWithSummary';

vi.mock(import('~/store/summary/useSummary'));

describe('useGroupsWithSummary', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns the set of groups that have at least one summary entry', () => {
        vi.mocked(useSummary).mockReturnValue([
            { group: 'Uogienės', name: 'Braškių' },
            { group: 'Uogienės', name: 'Vyšnių' },
            { group: 'Daržovės', name: 'Morkos' },
        ]);

        const { result } = renderHook(() => useGroupsWithSummary());

        expect(result.current).toStrictEqual(new Set(['Uogienės', 'Daržovės']));
    });

    it('returns an empty set when there is no summary data', () => {
        vi.mocked(useSummary).mockReturnValue([]);

        const { result } = renderHook(() => useGroupsWithSummary());

        expect(result.current).toStrictEqual(new Set());
    });

    it('only includes groups with summary entries matching the predicate', () => {
        vi.mocked(useSummary).mockReturnValue([
            { group: 'Uogienės', name: 'Braškių' },
            { group: 'Daržovės', name: 'Morkos' },
        ]);

        const { result } = renderHook(() => useGroupsWithSummary((name) => name.includes('Morkos')));

        expect(result.current).toStrictEqual(new Set(['Daržovės']));
    });
});
