import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';

import { noop } from 'lodash';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useProductFilters } from '~/client/filters/hooks/useProductFilters';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';

jest.mock('~/client/filters/hooks/useGroupFilter');
jest.mock('~/client/filters/hooks/useQuickFilter');
jest.mock('~/client/state/summary/useSummary');

describe('useFilteredList', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns unfiltered summary if no filters set', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce(['', noop]);

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });

    it('returns filtered summary', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce(['r', noop]);

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
        ]);
    });

    it('renders filtered group data', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce(['ūs', noop]);

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' })]);
    });

    it('renders selected group data', () => {
        jest.mocked(useGroupFilter).mockReturnValueOnce(['Uogienės', noop]).mockReturnValueOnce(['Uogienės', noop]);

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('renders filtered out data', () => {
        jest.mocked(useQuickFilter).mockReturnValueOnce(['z', noop]);

        const { result } = renderHook(() => useFilteredList(getSummaryFixture(), useProductFilters()));

        expect(result.current).toStrictEqual([]);
    });
});
