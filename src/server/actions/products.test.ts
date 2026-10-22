import type { ClientSession } from 'mongodb';

import { SchemaError, ZodError } from '~/schema';
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
import { getProductHistoryData } from '~/server/data/actionHistory';
import { moveProductOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProducts,
    getProductsWithYears,
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
vi.mock(import('~/server/data/actionHistory'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/variants'));

const { transactionSession } = vi.hoisted(() => ({ transactionSession: {} }));
vi.mock(import('~/server/db'), () => ({
    withinTransaction: vi.fn(async (fn: (session: ClientSession) => Promise<unknown>) =>
        fn(transactionSession as ClientSession)
    ),
}));

describe('product actions', () => {
    beforeEach(() => {
        vi.mocked(requireSession).mockResolvedValue({ email: 'session@example.com' });
        vi.mocked(getProducts).mockResolvedValue([]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('propagates duplicate and parent errors from the data transaction', async () => {
        vi.mocked(addProduct).mockRejectedValueOnce(new Error(SchemaError.NameAlreadyExists));

        await expect(addProductAction({ group: 'A', name: 'Pear' })).rejects.toThrow(SchemaError.NameAlreadyExists);

        vi.mocked(renameProduct).mockRejectedValueOnce(new Error(SchemaError.NameAlreadyExists));

        await expect(renameProductAction({ group: 'A', name: 'Apple', newName: 'Pear' })).rejects.toThrow(
            SchemaError.NameAlreadyExists
        );

        vi.mocked(moveProductOccurrences).mockRejectedValueOnce(new Error(SchemaError.CannotMoveProductWithChildren));

        await expect(moveProductAction({ group: 'A', name: 'Parent', newGroup: 'B' })).rejects.toThrow(
            SchemaError.CannotMoveProductWithChildren
        );
        expect(getProducts).not.toHaveBeenCalled();
    });

    it.each([
        () => addProductAction({ group: 'A', name: 'P', extra: true } as never),
        () => deleteProductAction({ group: 'A', name: 'P', extra: true } as never),
        () => renameProductAction({ group: 'A', name: 'P', newName: 'Q', extra: true } as never),
        () => moveProductAction({ group: 'A', name: 'P', newGroup: 'B', extra: true } as never),
        () => setProductParentAction({ group: 'A', name: 'P', parent: undefined, extra: true } as never),
        () => setProductImageAction({ group: 'A', name: 'P', image: '', extra: true } as never),
        () => setProductMissingAction({ group: 'A', name: 'P', missing: false, extra: true } as never),
        () => setProductExpiryToleranceAction({ group: 'A', name: 'P', days: 0, extra: true } as never),
        () => setProductRemovingAction({ group: 'A', name: 'P', year: 0, removing: false, extra: true } as never),
        () => applyReviewAction({ updates: [{ group: 'A', name: 'P', missing: false, extra: true }] } as never),
        () => setVariantImageAction({ group: 'A', name: 'P', variant: 'v', image: '', extra: true } as never),
        () =>
            transferAmountsAction({
                group: 'A',
                name: 'P',
                year: 0,
                targetGroup: 'B',
                targetName: 'Q',
                amounts: [{ variant: 'v', amount: 1 }],
                user: 'attacker',
            } as never),
        () =>
            moveConsumedToRecycledAction({
                group: 'A',
                name: 'P',
                year: 0,
                variant: 'v',
                amount: 1,
                user: 'attacker',
            } as never),
        () => undoProductAction({ group: 'A', name: 'P', year: 0, extra: true } as never),
        () => redoProductAction({ group: 'A', name: 'P', year: 0, extra: true } as never),
        () => getProductHistory({ group: 'A', name: 'P', year: 0, extra: true } as never),
    ])('rejects unexpected request fields before reading or mutating data', async (call) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);
        expect(getProducts).not.toHaveBeenCalled();
        expect(addProduct).not.toHaveBeenCalled();
        expect(deleteProduct).not.toHaveBeenCalled();
        expect(renameProduct).not.toHaveBeenCalled();
        expect(moveProductOccurrences).not.toHaveBeenCalled();
        expect(setAmounts).not.toHaveBeenCalled();
        expect(transferAmounts).not.toHaveBeenCalled();
        expect(moveConsumedToRecycled).not.toHaveBeenCalled();
    });

    it('accepts a fractional consumed amount', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        await moveConsumedToRecycledAction({ group: 'A', name: 'P', year: 2026, variant: 'v', amount: 0.5 });

        expect(moveConsumedToRecycled).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'P', year: 2026, variant: 'v', amount: 0.5 },
            'session@example.com',
            transactionSession
        );
    });

    it('loads product history through the data boundary', async () => {
        vi.mocked(getProductHistoryData).mockResolvedValue({ updates: [], undates: [] });

        await expect(getProductHistory({ group: 'A', name: 'B', year: 2026 })).resolves.toStrictEqual({
            updates: [],
            undates: [],
        });

        expect(getProductHistoryData).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'B', year: 2026 },
            transactionSession
        );
    });

    it.each([
        ['new product parent', () => addProductAction({ group: 'A', name: 'P', parent: 42 as never }), addProduct],
        ['blank product name', () => addProductAction({ group: 'A', name: '   ' }), addProduct],
        ['colon in product name', () => addProductAction({ group: 'A', name: 'P:Q' }), addProduct],
        ['deleted product identity', () => deleteProductAction({ group: 42 as never, name: 'P' }), deleteProduct],
        ['new product name', () => renameProductAction({ group: 'A', name: 'P', newName: {} as never }), renameProduct],
        [
            'target group',
            () => moveProductAction({ group: 'A', name: 'P', newGroup: 42 as never }),
            moveProductOccurrences,
        ],
        [
            'product parent',
            () => setProductParentAction({ group: 'A', name: 'P', parent: {} as never }),
            setProductParent,
        ],
        [
            'expiry tolerance',
            () => setProductExpiryToleranceAction({ group: 'A', name: 'P', days: -1 }),
            setProductExpiryTolerance,
        ],
        ['missing flag', () => setProductMissingAction({ group: 'A', name: 'P', missing: 'yes' as never }), setMissing],
        ['review update row', () => applyReviewAction({ updates: [null] as never }), setMissingBulk],
        [
            'unexpected review field',
            () => applyReviewAction({ updates: [{ group: 'A', name: 'P', missing: false, extra: true }] as never }),
            setMissingBulk,
        ],
        [
            'removing year',
            () => setProductRemovingAction({ group: 'A', name: 'P', year: NaN, removing: true }),
            setRemoving,
        ],
        ['product image', () => setProductImageAction({ group: 'A', name: 'P', image: 42 as never }), setImage],
        [
            'variant image identity',
            () => setVariantImageAction({ group: 'A', name: 'P', variant: [] as never, image: 'image' }),
            setVariantImage,
        ],
        [
            'variant image value',
            () => setVariantImageAction({ group: 'A', name: 'P', variant: 'v', image: 42 as never }),
            setVariantImage,
        ],
        [
            'stock row',
            () =>
                setAmountsAction({ group: 'A', name: 'P', year: 2026, amounts: [{ variant: 'v', amount: Infinity }] }),
            setAmounts,
        ],
        ['empty stock updates', () => setAmountsAction({ group: 'A', name: 'P', year: 2026, amounts: [] }), setAmounts],
        ['missing stock updates', () => setAmountsAction({ group: 'A', name: 'P', year: 2026 } as never), setAmounts],
        [
            'transfer row',
            () =>
                transferAmountsAction({
                    group: 'A',
                    name: 'P',
                    year: 2026,
                    targetGroup: 'B',
                    targetName: 'Q',
                    amounts: [{ variant: 'v', amount: -1 }],
                }),
            transferAmounts,
        ],
        [
            'recycling flags',
            () =>
                moveConsumedToRecycledAction({
                    group: 'A',
                    name: 'P',
                    year: 2026,
                    variant: 'v',
                    amount: 1,
                    flags: { home: 'yes' } as never,
                }),
            moveConsumedToRecycled,
        ],
        ['undo year', () => undoProductAction({ group: 'A', name: 'P', year: 1.5 }), undoProduct],
        ['redo identity', () => redoProductAction({ group: 'A', name: {} as never, year: 2026 }), redoProduct],
        [
            'product history identity',
            () => getProductHistory({ group: 42 as never, name: 'P', year: 2026 }),
            getProductHistoryData,
        ],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(Error);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it.each([
        () => addProductAction({ group: 'A', name: '   ' }),
        () => renameProductAction({ group: 'A', name: 'P', newName: 'P:Q' }),
        () => moveProductAction({ group: 'A', name: 'P', newGroup: 'B', newName: 'P:Q' }),
    ])('validates malformed product arguments before reading products', async (call) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);
        expect(getProducts).not.toHaveBeenCalled();
    });

    it('rejects untrusted author fields before writing stock', async () => {
        await expect(
            setAmountsAction({
                group: ' A ',
                name: ' P ',
                year: 2026,
                amounts: [{ variant: ' v ', amount: 2 }],
                _user: 'spoofed@example.com',
                user: 'attacker@example.com',
            } as never)
        ).rejects.toBeInstanceOf(ZodError);
        expect(setAmounts).not.toHaveBeenCalled();
    });

    it('normalizes stock identifiers and gets its author from the session', async () => {
        vi.mocked(setAmounts).mockResolvedValueOnce(true);
        await setAmountsAction({
            group: ' A ',
            name: ' P ',
            year: 2026,
            amounts: [{ variant: ' v ', amount: 2 }],
        });

        expect(setAmounts).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'P', year: 2026, amounts: [{ variant: 'v', amount: 2 }] },
            'session@example.com',
            transactionSession
        );
    });

    it('rejects an invalid history selection before reading data', async () => {
        await expect(getProductHistory({ group: '', name: 'B', year: 2026 })).rejects.toBeInstanceOf(ZodError);

        expect(getProductHistoryData).not.toHaveBeenCalled();
    });

    it('accepts a valid non-annual stock update', async () => {
        const amounts = [{ variant: 'v', amount: -2, recycled: false, home: true }];
        vi.mocked(setAmounts).mockResolvedValueOnce(true);

        await setAmountsAction({ group: 'A', name: 'P', year: 0, amounts, comment: 'correction' });

        expect(setAmounts).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'P', year: 0, amounts, comment: 'correction' },
            'session@example.com',
            transactionSession
        );
    });

    it('uses normalized product identities for business validation and persistence', async () => {
        vi.mocked(addProduct).mockRejectedValueOnce(new Error(SchemaError.NameAlreadyExists));

        await expect(addProductAction({ group: ' A ', name: ' PEAR ' })).rejects.toThrow(SchemaError.NameAlreadyExists);
        expect(addProduct).toHaveBeenCalledExactlyOnceWith({ group: 'A', name: 'PEAR' }, transactionSession);

        vi.mocked(renameProduct).mockResolvedValueOnce(true);
        await renameProductAction({ group: ' A ', name: ' Pear ', newName: ' Apple ' });

        expect(renameProduct).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'Pear', newName: 'Apple' },
            transactionSession
        );
    });

    it.each([
        () => deleteProductAction({ group: '', name: '' }),
        () => setAmountsAction({ group: '', name: '', year: NaN, amounts: [] }),
        () => getProductHistory({ group: '', name: '', year: NaN }),
    ])('authenticates before parsing invalid input or accessing product data', async (call) => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error(SchemaError.Unauthorized));

        await expect(call()).rejects.toThrow(SchemaError.Unauthorized);
        expect(getProducts).not.toHaveBeenCalled();
        expect(deleteProduct).not.toHaveBeenCalled();
        expect(setAmounts).not.toHaveBeenCalled();
        expect(getProductHistoryData).not.toHaveBeenCalled();
    });

    it('attributes transfers and recycled corrections to the session despite spoofed input', async () => {
        const amounts = [{ variant: 'v', amount: 2 }];
        vi.mocked(transferAmounts).mockResolvedValueOnce(true);
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        await transferAmountsAction({
            group: 'A',
            name: 'P',
            year: 2026,
            targetGroup: 'B',
            targetName: 'Q',
            amounts,
            comment: 'move',
        });
        await moveConsumedToRecycledAction({ group: 'A', name: 'P', year: 2026, variant: 'v', amount: 2, flags: {} });

        expect(transferAmounts).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'P', year: 2026, targetGroup: 'B', targetName: 'Q', amounts, comment: 'move' },
            'session@example.com',
            transactionSession
        );
        expect(moveConsumedToRecycled).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', name: 'P', year: 2026, variant: 'v', amount: 2, flags: {} },
            'session@example.com',
            transactionSession
        );
    });

    it.each([
        [
            'set',
            () => setAmountsAction({ group: 'A', name: 'P', year: 2026, amounts: [{ variant: 'v', amount: 2 }] }),
            setAmounts,
        ],
        [
            'transfer',
            () =>
                transferAmountsAction({
                    group: 'A',
                    name: 'P',
                    year: 2026,
                    targetGroup: 'B',
                    targetName: 'Q',
                    amounts: [{ variant: 'v', amount: 2 }],
                }),
            transferAmounts,
        ],
        [
            'recycle',
            () => moveConsumedToRecycledAction({ group: 'A', name: 'P', year: 2026, variant: 'v', amount: 2 }),
            moveConsumedToRecycled,
        ],
    ] as const)('rejects %s without an authenticated email', async (_label, call, write) => {
        vi.mocked(requireSession).mockResolvedValueOnce({});

        await expect(call()).rejects.toThrow('Unauthorized');
        expect(write).not.toHaveBeenCalled();
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
        [
            'add',
            () => addProductAction({ group: 'A', name: 'P', parent: 'Parent' }),
            addProduct,
            [{ group: 'A', name: 'P', parent: 'Parent' }, transactionSession],
        ],
        [
            'delete',
            () => deleteProductAction({ group: 'A', name: 'P' }),
            deleteProduct,
            [{ group: 'A', name: 'P' }, transactionSession],
        ],
        [
            'rename',
            () => renameProductAction({ group: 'A', name: 'P', newName: 'New' }),
            renameProduct,
            [{ group: 'A', name: 'P', newName: 'New' }, transactionSession],
        ],
        [
            'move',
            () => moveProductAction({ group: 'A', name: 'P', newGroup: 'B', newName: 'New' }),
            moveProductOccurrences,
            [{ group: 'A', name: 'P', newGroup: 'B', newName: 'New' }, transactionSession],
        ],
        [
            'set parent',
            () => setProductParentAction({ group: 'A', name: 'P', parent: 'Parent' }),
            setProductParent,
            [{ group: 'A', name: 'P', parent: 'Parent' }, transactionSession],
        ],
        [
            'set expiry tolerance',
            () => setProductExpiryToleranceAction({ group: 'A', name: 'P', days: 30 }),
            setProductExpiryTolerance,
            [{ group: 'A', name: 'P', days: 30 }, transactionSession],
        ],
        [
            'set missing',
            () => setProductMissingAction({ group: 'A', name: 'P', missing: true }),
            setMissing,
            [{ group: 'A', name: 'P', missing: true }, transactionSession],
        ],
        [
            'apply review',
            () => applyReviewAction({ updates: [{ group: 'A', name: 'P', missing: false }] }),
            setMissingBulk,
            [{ updates: [{ group: 'A', name: 'P', missing: false }] }, transactionSession],
        ],
        [
            'set removing',
            () => setProductRemovingAction({ group: 'A', name: 'P', year: 2026, removing: true }),
            setRemoving,
            [{ group: 'A', name: 'P', year: 2026, removing: true }, transactionSession],
        ],
        [
            'set image',
            () => setProductImageAction({ group: 'A', name: 'P', image: 'image' }),
            setImage,
            [{ group: 'A', name: 'P', image: 'image' }, transactionSession],
        ],
        [
            'remove product image',
            () => setProductImageAction({ group: 'A', name: 'P', image: '' }),
            setImage,
            [{ group: 'A', name: 'P', image: '' }, transactionSession],
        ],
        [
            'set variant image',
            () => setVariantImageAction({ group: 'A', name: 'P', variant: 'v', image: 'image' }),
            setVariantImage,
            [{ group: 'A', name: 'P', variant: 'v', image: 'image' }, transactionSession],
        ],
        [
            'remove variant image',
            () => setVariantImageAction({ group: 'A', name: 'P', variant: 'v', image: '' }),
            setVariantImage,
            [{ group: 'A', name: 'P', variant: 'v', image: '' }, transactionSession],
        ],
        [
            'set amounts',
            () => setAmountsAction({ group: 'A', name: 'P', year: 2026, amounts: [{ variant: 'v', amount: 2 }] }),
            setAmounts,
            [
                { group: 'A', name: 'P', year: 2026, amounts: [{ variant: 'v', amount: 2 }] },
                'session@example.com',
                transactionSession,
            ],
        ],
        [
            'transfer amounts',
            () =>
                transferAmountsAction({
                    group: 'A',
                    name: 'P',
                    year: 2026,
                    targetGroup: 'B',
                    targetName: 'Q',
                    amounts: [{ variant: 'v', amount: 2 }],
                }),
            transferAmounts,
            [
                {
                    group: 'A',
                    name: 'P',
                    year: 2026,
                    targetGroup: 'B',
                    targetName: 'Q',
                    amounts: [{ variant: 'v', amount: 2 }],
                },
                'session@example.com',
                transactionSession,
            ],
        ],
        [
            'recycle consumed',
            () => moveConsumedToRecycledAction({ group: 'A', name: 'P', year: 2026, variant: 'v', amount: 2 }),
            moveConsumedToRecycled,
            [{ group: 'A', name: 'P', year: 2026, variant: 'v', amount: 2 }, 'session@example.com', transactionSession],
        ],
        [
            'undo',
            () => undoProductAction({ group: 'A', name: 'P', year: 2026 }),
            undoProduct,
            [{ group: 'A', name: 'P', year: 2026 }, transactionSession],
        ],
        [
            'redo',
            () => redoProductAction({ group: 'A', name: 'P', year: 2026 }),
            redoProduct,
            [{ group: 'A', name: 'P', year: 2026 }, transactionSession],
        ],
    ] as const)('%s forwards valid data and reports a failed write', async (_label, call, dataFunction, args) => {
        vi.mocked(dataFunction)
            .mockResolvedValueOnce(true as never)
            .mockResolvedValueOnce(false as never);
        await call();

        expect(dataFunction).toHaveBeenCalledWith(...args);
        await expect(call()).rejects.toThrow('The requested change could not be applied');
    });
});
