import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetSummaryHistory } from '~/features/summary/hooks/useGetSummaryHistory';
import { getSummaryHistory } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/summary'));

describe('useGetSummaryHistory', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads the selected summary history into the summary cache', async () => {
        const year = 25;
        const history = { updates: [], undates: [] };
        vi.mocked(getSummaryHistory).mockResolvedValueOnce(history);
        const { client, wrapper } = mockQuery({ summary: [{ group: 'Uogienės', name: 'Avietės', years: [] }] });
        const { result } = renderHook(() => useGetSummaryHistory({ year, group: 'Uogienės', name: 'Avietės' }), {
            wrapper,
        });
        await result.current();

        expect(getSummaryHistory).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year });
        expect(client.getQueryData(CATALOG_KEYS.summary)).toStrictEqual([
            { group: 'Uogienės', name: 'Avietės', years: [], history: { [year]: history } },
        ]);
    });

    it.each([
        [undefined, undefined],
        ['Uogienės', undefined],
    ])('does not request history without a complete key', async (group, name) => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(() => useGetSummaryHistory({ year: 25, group: group ?? '', name: name ?? '' }), {
            wrapper,
        });
        await result.current();

        expect(getSummaryHistory).not.toHaveBeenCalled();
    });

    it('keeps its loader stable when the request object is recreated', () => {
        const { wrapper } = mockQuery();
        const { result, rerender } = renderHook(() => useGetSummaryHistory({ year: 25, group: 'A', name: 'B' }), {
            wrapper,
        });
        const loader = result.current;
        rerender();

        expect(result.current).toBe(loader);
    });
});
