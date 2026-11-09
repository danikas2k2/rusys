import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { invalidatePendingProductHistory, useGetProductHistory } from '~/features/products/hooks/useGetProductHistory';
import { getProductHistory } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('~/server/actions/products'));

describe('useGetProductHistory', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads the selected product history into the product cache', async () => {
        const year = 22;
        const history = { updates: [], undates: [] };
        vi.mocked(getProductHistory).mockResolvedValueOnce(history);
        const { client, wrapper } = mockQuery({
            products: [
                { group: 'Uogienės', name: 'Avietės', years: [] },
                { group: 'Uogienės', name: 'Braškės', years: [] },
                { group: 'Daržovės', name: 'Morkos', years: [] },
            ],
        });
        const { result } = renderHook(() => useGetProductHistory({ year, group: 'Uogienės', name: 'Avietės' }), {
            wrapper,
        });
        await result.current();

        expect(getProductHistory).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year });
        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'Uogienės', name: 'Avietės', years: [], history: { [year]: history } },
            { group: 'Uogienės', name: 'Braškės', years: [] },
            { group: 'Daržovės', name: 'Morkos', years: [] },
        ]);
    });

    it('does not request history without a selected product', async () => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(() => useGetProductHistory({ year: 22, group: '', name: '' }), { wrapper });
        await result.current();

        expect(getProductHistory).not.toHaveBeenCalled();
    });

    it('does not create a product cache when history arrives after the catalog is removed', async () => {
        let resolve!: (value: { updates: []; undates: [] }) => void;
        vi.mocked(getProductHistory).mockReturnValueOnce(
            new Promise((res) => {
                resolve = res;
            })
        );
        const { client, wrapper } = mockQuery({ products: [{ group: 'A', name: 'B', years: [] }] });
        const { result } = renderHook(() => useGetProductHistory({ year: 22, group: 'A', name: 'B' }), { wrapper });
        const pending = result.current();
        client.removeQueries({ queryKey: CATALOG_KEYS.products });
        resolve({ updates: [], undates: [] });
        await pending;

        expect(client.getQueryData(CATALOG_KEYS.products)).toBeUndefined();
    });

    it('does not restore stale history after an in-flight response is invalidated', async () => {
        let resolve!: (value: { updates: []; undates: [] }) => void;
        vi.mocked(getProductHistory).mockReturnValueOnce(
            new Promise((res) => {
                resolve = res;
            })
        );
        const { client, wrapper } = mockQuery({ products: [{ group: 'A', name: 'B', years: [] }] });
        const { result } = renderHook(() => useGetProductHistory({ year: 22, group: 'A', name: 'B' }), { wrapper });
        const pending = result.current();
        invalidatePendingProductHistory(client, { group: 'A', name: 'B', year: 22 });
        resolve({ updates: [], undates: [] });
        await pending;

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([{ group: 'A', name: 'B', years: [] }]);
    });

    it('invalidates only the selected history and preserves a newer response', async () => {
        let resolveOld!: (value: { updates: []; undates: [] }) => void;
        let resolveOther!: (value: { updates: []; undates: [] }) => void;
        const oldHistory = { updates: [], undates: [] };
        const newHistory = { updates: [{ group: 'A', name: 'B', time: 1, amounts: [] }], undates: [] };
        const otherHistory = { updates: [], undates: [] };
        vi.mocked(getProductHistory)
            .mockReturnValueOnce(
                new Promise((res) => {
                    resolveOld = res;
                })
            )
            .mockReturnValueOnce(
                new Promise((res) => {
                    resolveOther = res;
                })
            )
            .mockResolvedValueOnce(newHistory);
        const { client, wrapper } = mockQuery({ products: [{ group: 'A', name: 'B', years: [] }] });
        const first = renderHook(() => useGetProductHistory({ year: 22, group: 'A', name: 'B' }), { wrapper });
        const other = renderHook(() => useGetProductHistory({ year: 23, group: 'A', name: 'B' }), { wrapper });
        const old = first.result.current();
        const pendingOther = other.result.current();
        invalidatePendingProductHistory(client, { group: 'A', name: 'B', year: 22 });
        await first.result.current();
        resolveOld(oldHistory);
        resolveOther(otherHistory);
        await Promise.all([old, pendingOther]);

        expect(client.getQueryData(CATALOG_KEYS.products)).toStrictEqual([
            { group: 'A', name: 'B', years: [], history: { 22: newHistory, 23: otherHistory } },
        ]);
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
