import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';

import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';

vi.mock('~/client/filters/hooks/useGroupFilter');
vi.mock('~/client/filters/hooks/useQuickFilter');
vi.mock('~/client/state/summary/useSummary');

describe('useFilteredList', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns unfiltered summary if no filters set', () => {
        vi.mocked(useQuickFilter).mockReturnValueOnce('');

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });

    it('returns filtered summary', () => {
        vi.mocked(useQuickFilter).mockReturnValueOnce('r');

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
        ]);
    });

    it('renders filtered group data', () => {
        vi.mocked(useQuickFilter).mockReturnValueOnce('ūs');

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' })]);
    });

    it('renders selected group data', () => {
        vi.mocked(useGroupFilter).mockReturnValueOnce('Uogienės').mockReturnValueOnce('Uogienės');

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('renders filtered out data', () => {
        vi.mocked(useQuickFilter).mockReturnValueOnce('z');

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([]);
    });
});
