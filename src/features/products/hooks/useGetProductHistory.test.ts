import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetProductHistory } from '~/features/products/hooks/useGetProductHistory';
import { getProductHistory } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/products'));

describe('useGetProductHistory', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads the selected product history into the product cache', async () => {
        const year = 22;
        const history = { updates: [], undates: [] };
        vi.mocked(getProductHistory).mockResolvedValueOnce(history);
        const { client, wrapper } = mockQuery({ products: [{ group: 'Uogienės', name: 'Avietės', years: [] }] });
        const { result } = renderHook(() => useGetProductHistory({ year, group: 'Uogienės', name: 'Avietės' }), {
            wrapper,
        });
        await result.current();

        expect(getProductHistory).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Uogienės', name: 'Avietės', years: [], history: { [year]: history } },
        ]);
    });

    it('does not request history without a selected product', async () => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(() => useGetProductHistory({ year: 22, group: '', name: '' }), { wrapper });
        await result.current();

        expect(getProductHistory).not.toHaveBeenCalled();
    });

    it('keeps its loader stable when the request object is recreated', () => {
        const { wrapper } = mockQuery();
        const { result, rerender } = renderHook(() => useGetProductHistory({ year: 22, group: 'A', name: 'B' }), {
            wrapper,
        });
        const loader = result.current;
        rerender();

        expect(result.current).toBe(loader);
    });
});
