import { renderHook } from '@testing-library/react';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';
import { getSummaryFixture } from '~/tests/fixtures';

jest.mock('~/state/filter/useFilter');
jest.mock('~/state/group/useGroup');
jest.mock('~/state/summary/useSummary');

describe('useFilteredList', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns unfiltered summary if no filters set', () => {
        (useFilter as jest.Mock).mockReturnValueOnce('');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));
        expect(result.current).toEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
        ]);
    });

    it('returns filtered summary', () => {
        (useFilter as jest.Mock).mockReturnValueOnce('r');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));
        expect(result.current).toEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
            expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
        ]);
    });

    it('renders filtered group data', () => {
        (useFilter as jest.Mock).mockReturnValueOnce('ūs');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));
        expect(result.current).toEqual([expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' })]);
    });

    it('renders selected group data', () => {
        (useGroup as jest.Mock).mockReturnValueOnce('Uogienės').mockReturnValueOnce('Uogienės');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));
        expect(result.current).toEqual([
            expect.objectContaining({ group: 'Uogienės', name: 'Avietės' }),
            expect.objectContaining({ group: 'Uogienės', name: 'Braškės' }),
        ]);
    });

    it('renders filtered out data', () => {
        (useFilter as jest.Mock).mockReturnValueOnce('z');
        const { result } = renderHook(() => useFilteredList(getSummaryFixture()));
        expect(result.current).toEqual([]);
    });
});
