import { renderHook } from '@testing-library/react';
import { getSummaryFixture } from '@tests/fixtures';

import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';

jest.mock('~/state/filter/useFilter');
jest.mock('~/state/group/useGroup');
jest.mock('~/state/summary/useSummary');

describe('useFilteredList', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns unfiltered summary if no filters set', () => {
        jest.mocked(useFilter).mockReturnValueOnce('');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });

    it('returns filtered summary', () => {
        jest.mocked(useFilter).mockReturnValueOnce('r');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
        ]);
    });

    it('renders filtered group data', () => {
        jest.mocked(useFilter).mockReturnValueOnce('ūs');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));

        expect(result.current).toStrictEqual([expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' })]);
    });

    it('renders selected group data', () => {
        jest.mocked(useGroup).mockReturnValueOnce('Uogienės').mockReturnValueOnce('Uogienės');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));

        expect(result.current).toStrictEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('renders filtered out data', () => {
        jest.mocked(useFilter).mockReturnValueOnce('z');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));

        expect(result.current).toStrictEqual([]);
    });
});
