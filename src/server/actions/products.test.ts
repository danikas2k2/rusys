import {
    addProductAction,
    applyReviewAction,
    deleteProductAction,
    getProductHistory,
    getProductsAction,
    moveConsumedToRecycledAction,
    moveProductAction,
    redoProductAction,
    renameProductAction,
    setAmountsAction,
    setProductExpiryToleranceAction,
    setProductImageAction,
    setProductMissingAction,
    setProductParentAction,
    setProductRemovingAction,
    setVariantImageAction,
    transferAmountsAction,
    undoProductAction,
} from '~/server/actions/products';
import { requireSession } from '~/server/auth/session';
import { moveProductOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProductsWithYears,
    getProductUndates,
    getProductUpdates,
    moveConsumedToRecycled,
    redoProduct,
    renameProduct,
    setAmounts,
    setImage,
    setMissing,
    setMissingBulk,
    setProductExpiryTolerance,
    setProductParent,
    setRemoving,
    setVariantImage,
    transferAmounts,
    undoProduct,
} from '~/server/data/products';
import { getVariants } from '~/server/data/variants';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/variants'));

describe('product actions', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads product history directly from server data functions', async () => {
        vi.mocked(getProductUpdates).mockResolvedValue([]);
        vi.mocked(getProductUndates).mockResolvedValue([]);

        await expect(getProductHistory('A', 'B', 2026)).resolves.toStrictEqual({ updates: [], undates: [] });

        expect(getProductUpdates).toHaveBeenCalledWith('A', 'B', 2026);
        expect(getProductUndates).toHaveBeenCalledWith('A', 'B', 2026);
    });

    it.each([
        ['new product parent', () => addProductAction('A', 'P', 42 as never), addProduct],
        ['deleted product identity', () => deleteProductAction(42 as never, 'P'), deleteProduct],
        ['new product name', () => renameProductAction('A', 'P', {} as never), renameProduct],
        ['target group', () => moveProductAction('A', 'P', 42 as never), moveProductOccurrences],
        ['product parent', () => setProductParentAction('A', 'P', {} as never), setProductParent],
        ['expiry tolerance', () => setProductExpiryToleranceAction('A', 'P', -1), setProductExpiryTolerance],
        ['missing flag', () => setProductMissingAction('A', 'P', 'yes' as never), setMissing],
        ['review update row', () => applyReviewAction([null] as never), setMissingBulk],
        ['removing year', () => setProductRemovingAction('A', 'P', NaN, true), setRemoving],
        ['product image', () => setProductImageAction('A', 'P', 42 as never), setImage],
        ['variant image identity', () => setVariantImageAction('A', 'P', [] as never, 'image'), setVariantImage],
        ['variant image value', () => setVariantImageAction('A', 'P', 'v', 42 as never), setVariantImage],
        ['stock row', () => setAmountsAction('A', 'P', 2026, [{ variant: 'v', amount: Infinity }]), setAmounts],
        [
            'transfer row',
            () => transferAmountsAction('A', 'P', 2026, 'B', 'Q', [{ variant: 'v', amount: -1 }]),
            transferAmounts,
        ],
        [
            'recycling flags',
            () => moveConsumedToRecycledAction('A', 'P', 2026, 'v', 1, { home: 'yes' } as never),
            moveConsumedToRecycled,
        ],
        ['undo year', () => undoProductAction('A', 'P', 1.5), undoProduct],
        ['redo identity', () => redoProductAction('A', {} as never, 2026), redoProduct],
        ['product history identity', () => getProductHistory(42 as never, 'P', 2026), getProductUndates],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(Error);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it('rejects an invalid history selection before reading data', async () => {
        await expect(getProductHistory('', 'B', 2026)).rejects.toThrow('Invalid history selection');

        expect(getProductUpdates).not.toHaveBeenCalled();
    });

    it('accepts a valid non-annual stock update', async () => {
        const amounts = [{ variant: 'v', amount: -2, recycled: false, home: true }];
        vi.mocked(setAmounts).mockResolvedValueOnce(true);

        await setAmountsAction('A', 'P', 0, amounts, 'tester', 'correction');

        expect(setAmounts).toHaveBeenCalledExactlyOnceWith('A', 'P', 0, amounts, 'tester', 'correction');
    });

    it('loads products with their related groups and variants', async () => {
        const products = [{ group: 'A', name: 'P' }];
        const groups = [{ group: 'A', order: 0 }];
        const variants = [{ group: 'A', variant: 'v', order: 0 }];
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products, years: [2026] });
        vi.mocked(getGroups).mockResolvedValueOnce(groups);
        vi.mocked(getVariants).mockResolvedValueOnce(variants);

        await expect(getProductsAction()).resolves.toStrictEqual({ products, years: [2026], groups, variants });
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it.each([
        ['add', () => addProductAction('A', 'P', 'Parent'), addProduct, ['A', 'P', 'Parent']],
        ['delete', () => deleteProductAction('A', 'P'), deleteProduct, ['A', 'P']],
        ['rename', () => renameProductAction('A', 'P', 'New'), renameProduct, ['A', 'P', 'New']],
        ['move', () => moveProductAction('A', 'P', 'B', 'New'), moveProductOccurrences, ['A', 'P', 'B', 'New']],
        ['set parent', () => setProductParentAction('A', 'P', 'Parent'), setProductParent, ['A', 'P', 'Parent']],
        [
            'set expiry tolerance',
            () => setProductExpiryToleranceAction('A', 'P', 30),
            setProductExpiryTolerance,
            ['A', 'P', 30],
        ],
        ['set missing', () => setProductMissingAction('A', 'P', true), setMissing, ['A', 'P', true]],
        [
            'apply review',
            () => applyReviewAction([{ group: 'A', name: 'P', missing: false }]),
            setMissingBulk,
            [[{ group: 'A', name: 'P', missing: false }]],
        ],
        ['set removing', () => setProductRemovingAction('A', 'P', 2026, true), setRemoving, ['A', 'P', 2026, true]],
        ['set image', () => setProductImageAction('A', 'P', 'image'), setImage, ['A', 'P', 'image']],
        ['remove product image', () => setProductImageAction('A', 'P', ''), setImage, ['A', 'P', '']],
        [
            'set variant image',
            () => setVariantImageAction('A', 'P', 'v', 'image'),
            setVariantImage,
            ['A', 'P', 'v', 'image'],
        ],
        ['remove variant image', () => setVariantImageAction('A', 'P', 'v', ''), setVariantImage, ['A', 'P', 'v', '']],
        [
            'set amounts',
            () => setAmountsAction('A', 'P', 2026, [{ variant: 'v', amount: 2 }]),
            setAmounts,
            ['A', 'P', 2026, [{ variant: 'v', amount: 2 }], undefined, undefined],
        ],
        [
            'transfer amounts',
            () => transferAmountsAction('A', 'P', 2026, 'B', 'Q', [{ variant: 'v', amount: 2 }]),
            transferAmounts,
            ['A', 'P', 2026, 'B', 'Q', [{ variant: 'v', amount: 2 }], undefined, undefined],
        ],
        [
            'recycle consumed',
            () => moveConsumedToRecycledAction('A', 'P', 2026, 'v', 2),
            moveConsumedToRecycled,
            ['A', 'P', 2026, 'v', 2, {}, undefined],
        ],
        ['undo', () => undoProductAction('A', 'P', 2026), undoProduct, ['A', 'P', 2026]],
        ['redo', () => redoProductAction('A', 'P', 2026), redoProduct, ['A', 'P', 2026]],
    ] as const)('%s forwards valid data and reports a failed write', async (_label, call, dataFunction, args) => {
        vi.mocked(dataFunction)
            .mockResolvedValueOnce(true as never)
            .mockResolvedValueOnce(false as never);
        await call();

        expect(dataFunction).toHaveBeenCalledWith(...args);
        await expect(call()).rejects.toThrow('The requested change could not be applied');
    });
});
