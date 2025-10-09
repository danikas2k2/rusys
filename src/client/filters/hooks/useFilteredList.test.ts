import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';

import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';

jest.mock('~/client/filters/hooks/useGroupFilter');
jest.mock('~/client/filters/hooks/useQuickFilter');
jest.mock('~/client/state/summary/useSummary');

describe('useFilteredList', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns unfiltered summary if no filters set', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce('');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useDetailsFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });

    it('returns filtered summary', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce('r');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useDetailsFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
        ]);
    });

    it('renders filtered group data', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce('ūs');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useDetailsFilters()));

        expect(result.current).toStrictEqual([expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' })]);
    });

    it('renders selected group data', () => {
        jest.mocked(useGroupFilter).mockReturnValueOnce('Uogienės').mockReturnValueOnce('Uogienės');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useDetailsFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('renders filtered out data', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce('z');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useDetailsFilters()));

        expect(result.current).toStrictEqual([]);
    });
});
