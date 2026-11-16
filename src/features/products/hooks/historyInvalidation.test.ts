import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGetConsumedHistory } from '~/features/products/hooks/useGetConsumedHistory';
import type { Product, ProductHistory, Summary } from '~/schema';
import {
    getProductHistory,
    moveConsumedToRecycledAction,
    redoProductAction,
    setAmountsAction,
    transferAmountsAction,
    undoProductAction,
} from '~/server/actions/products';
import { getSummaryHistory } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';
import { useGetProductHistory } from './useGetProductHistory';
import { useMoveConsumedToRecycled } from './useMoveConsumedToRecycled';
import { useRedoProduct } from './useRedoProduct';
import { useSetAmounts } from './useSetAmounts';
import { useTransferAmounts } from './useTransferAmounts';
import { useUndoProduct } from './useUndoProduct';

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock(import('~/server/actions/products'));
vi.mock(import('~/server/actions/summary'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

const identity = { group: 'G', name: 'N' };
const old: ProductHistory = { updates: [{ ...identity, time: 1, amounts: [] }], undates: [] };
const fresh: ProductHistory = { updates: [{ ...identity, time: 2, amounts: [] }], undates: [] };
const history = { 22: old, 23: old, 25: old, 26: old };
const operations = [
    { name: 'save', action: setAmountsAction },
    { name: 'undo', action: undoProductAction },
    { name: 'redo', action: redoProductAction },
    { name: 'recycle', action: moveConsumedToRecycledAction },
    { name: 'transfer', action: transferAmountsAction },
] as const;

function setup() {
    const { client, wrapper } = mockQuery({
        products: [
            { ...identity, history },
            { group: 'G', name: 'Target', history },
            { group: 'Other', name: 'N', history },
        ],
        summary: [
            { ...identity, history },
            { group: 'G', name: 'Target', history },
            { group: 'Other', name: 'N', history },
        ],
    });
    const { result } = renderHook(
        () => {
            const save = useSetAmounts();
            const undo = useUndoProduct();
            const redo = useRedoProduct();
            const recycle = useMoveConsumedToRecycled();
            const transfer = useTransferAmounts();
            return {
                save: () => save({ ...identity, year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }),
                undo: () => undo({ ...identity, year: 22 }),
                redo: () => redo({ ...identity, year: 22 }),
                recycle: () => recycle({ ...identity, year: 22, variant: 'd', amount: 1 }),
                transfer: () =>
                    transfer({
                        ...identity,
                        year: 22,
                        amounts: [{ variant: 'd', amount: 1 }],
                        targetGroup: 'G',
                        targetName: 'Target',
                    }),
                stock: useGetProductHistory({ ...identity, year: 22 }),
                consumed: useGetConsumedHistory({ ...identity, year: 25 }),
            };
        },
        { wrapper }
    );
    return { client, result };
}

describe('history invalidation after committed stock changes', () => {
    afterEach(() => vi.clearAllMocks());

    it.each(operations)('$name clears both year caches and rejects earlier in-flight responses', async ({ name }) => {
        let resolveStock!: (value: ProductHistory) => void;
        let resolveConsumed!: (value: ProductHistory) => void;
        vi.mocked(getProductHistory).mockReturnValueOnce(
            new Promise((resolve) => {
                resolveStock = resolve;
            })
        );
        vi.mocked(getSummaryHistory).mockReturnValueOnce(
            new Promise((resolve) => {
                resolveConsumed = resolve;
            })
        );
        const { client, result } = setup();
        const stockRequest = result.current.stock();
        const consumedRequest = result.current.consumed();

        await result.current[name]();
        resolveStock(old);
        resolveConsumed(old);
        await Promise.all([stockRequest, consumedRequest]);

        for (const key of [CATALOG_KEYS.products, CATALOG_KEYS.summary]) {
            const entries = client.getQueryData<readonly (Product | Summary)[]>(key)!;

            expect(entries[0]!.history).toBeUndefined();
            expect(entries[1]!.history).toStrictEqual(name === 'transfer' ? undefined : history);
            expect(entries[2]!.history).toStrictEqual(history);
        }

        vi.mocked(getProductHistory).mockResolvedValueOnce(fresh);
        vi.mocked(getSummaryHistory).mockResolvedValueOnce(fresh);
        await result.current.stock();
        await result.current.consumed();

        expect(client.getQueryData<readonly Product[]>(CATALOG_KEYS.products)?.[0]?.history?.[22]).toStrictEqual(fresh);
        expect(client.getQueryData<readonly Summary[]>(CATALOG_KEYS.summary)?.[0]?.history?.[25]).toStrictEqual(fresh);
    });

    it.each(operations)('$name preserves cached histories when persistence fails', async ({ name, action }) => {
        vi.mocked(action).mockRejectedValueOnce(new Error('Write failed'));
        const { client, result } = setup();

        await expect(result.current[name]()).rejects.toThrow('Write failed');

        expect(client.getQueryData<readonly Product[]>(CATALOG_KEYS.products)?.[0]?.history).toStrictEqual(history);
        expect(client.getQueryData<readonly Summary[]>(CATALOG_KEYS.summary)?.[0]?.history).toStrictEqual(history);
        expect(refresh).not.toHaveBeenCalled();
    });

    it('keeps both caches invalid after a committed change even if refreshing the catalog fails', async () => {
        refresh.mockRejectedValueOnce(new Error('Refresh failed'));
        const { client, result } = setup();

        await expect(result.current.undo()).rejects.toThrow('Refresh failed');

        expect(client.getQueryData<readonly Product[]>(CATALOG_KEYS.products)?.[0]?.history).toBeUndefined();
        expect(client.getQueryData<readonly Summary[]>(CATALOG_KEYS.summary)?.[0]?.history).toBeUndefined();
    });
});
