import type { ClientSession } from 'mongodb';
import { ZodError } from 'zod';

import { SchemaError } from '~/schema';
import {
    copyVariantAction,
    deleteVariantAction,
    getVariantsAction,
    renameVariantAction,
    reorderVariantsAction,
    updateVariantAction,
} from '~/server/actions/variants';
import { requireSession } from '~/server/auth/session';
import { getGroups } from '~/server/data/groups';
import { renameProductsVariant } from '~/server/data/products/mutations';
import {
    copyVariant,
    deleteVariant,
    getVariant,
    getVariants,
    renameVariant,
    reorderVariants,
    updateVariant,
} from '~/server/data/variants';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/products/mutations'));
vi.mock(import('~/server/db'), () => ({ withinTransaction: vi.fn((callback) => callback(transactionSession)) }));
const transactionSession = {} as ClientSession;

describe('saveVariant', () => {
    beforeEach(() => vi.mocked(getVariants).mockResolvedValue([]));

    afterEach(() => vi.clearAllMocks());

    it('forwards omitted fields for the data layer to resolve', async () => {
        vi.mocked(updateVariant).mockResolvedValue(true);

        await updateVariantAction({ group: 'Uogienės', variant: 'p', count: 5 });

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(updateVariant).toHaveBeenCalledExactlyOnceWith(
            { group: 'Uogienės', variant: 'p', count: 5 },
            transactionSession
        );
    });

    it('does not mutate without a session', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(updateVariantAction({ group: 'Uogienės', variant: 'p' })).rejects.toThrow('Unauthorized');

        expect(updateVariant).not.toHaveBeenCalled();
    });

    it('forwards zero order, an empty suffix and omitted amount fields', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(true);

        await updateVariantAction({ group: 'A', variant: 'v', order: 0, suffix: '' });

        expect(updateVariant).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', variant: 'v', order: 0, suffix: '' },
            transactionSession
        );
    });
});

describe('variant action schema', () => {
    beforeEach(() => vi.mocked(getVariants).mockResolvedValue([]));

    afterEach(() => vi.clearAllMocks());

    it.each([
        ['variant fields', () => updateVariantAction({ group: 'A', variant: 'v', count: NaN }), updateVariant],
        [
            'variant name',
            () => renameVariantAction({ group: 'A', variant: 'v', targetVariant: 42 as never }),
            renameVariant,
        ],
        [
            'colon in variant name',
            () => renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'bad:name' }),
            renameVariant,
        ],
        [
            'copied variant fields',
            () =>
                copyVariantAction({
                    group: 'A',
                    variant: 'v',
                    targetGroup: 'B',
                    targetVariant: undefined,
                    units: 'invalid' as never,
                }),
            copyVariant,
        ],
        ['deleted variant identity', () => deleteVariantAction({ group: 'A', variant: 42 as never }), deleteVariant],
        ['variant order', () => reorderVariantsAction({ group: 'A', variants: { v: NaN } }), reorderVariants],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it.each([
        () => renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'bad:name' }),
        () => copyVariantAction({ group: 'A', variant: 'v', targetGroup: 'B', targetVariant: 'bad:name' }),
    ])('validates malformed variant arguments before reading variants', async (call) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);
        expect(getVariants).not.toHaveBeenCalled();
    });

    it('rejects a negative amount before reading variants', async () => {
        await expect(updateVariantAction({ group: 'A', variant: 'v', count: -1 })).rejects.toThrow(
            SchemaError.InvalidRequest
        );
        expect(getVariants).not.toHaveBeenCalled();
        expect(updateVariant).not.toHaveBeenCalled();
    });

    it.each([
        () => updateVariantAction({ group: 'A', variant: 'v', update: { count: 2 } } as never),
        () => renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new', update: { count: 2 } } as never),
        () => copyVariantAction({ group: 'A', variant: 'v', targetGroup: 'B', update: { count: 2 } } as never),
    ])('rejects the obsolete nested update payload before reading or writing data', async (call) => {
        await expect(call()).rejects.toBeInstanceOf(ZodError);
        expect(getVariants).not.toHaveBeenCalled();
        expect(getVariant).not.toHaveBeenCalled();
        expect(updateVariant).not.toHaveBeenCalled();
        expect(renameVariant).not.toHaveBeenCalled();
        expect(copyVariant).not.toHaveBeenCalled();
    });

    it('delegates uniqueness checks without reading a catalog snapshot', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(true);
        vi.mocked(renameVariant).mockResolvedValueOnce(true);
        vi.mocked(copyVariant).mockResolvedValueOnce(true);

        await updateVariantAction({ group: 'A', variant: 'PEAR' });
        await renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'PEAR' });
        await copyVariantAction({ group: 'A', variant: 'v', targetGroup: 'B' });

        expect(getVariants).not.toHaveBeenCalled();
        expect(getVariant).not.toHaveBeenCalled();
        expect(updateVariant).toHaveBeenCalledWith({ group: 'A', variant: 'PEAR' }, transactionSession);
        expect(renameVariant).toHaveBeenCalledWith(
            { group: 'A', variant: 'v', targetVariant: 'PEAR' },
            transactionSession
        );
        expect(copyVariant).toHaveBeenCalledWith({ group: 'A', variant: 'v', targetGroup: 'B' }, transactionSession);
    });

    it('accepts a valid variant order map', async () => {
        vi.mocked(reorderVariants).mockResolvedValueOnce(true);

        await reorderVariantsAction({ group: 'A', variants: { v: 1.5 } });

        expect(reorderVariants).toHaveBeenCalledExactlyOnceWith('A', { v: 1.5 }, transactionSession);
    });

    it('uses trimmed identities and order-map keys from the parsed request', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(true);
        vi.mocked(deleteVariant).mockResolvedValueOnce(true);
        vi.mocked(reorderVariants).mockResolvedValueOnce(true);

        await updateVariantAction({ group: ' A ', variant: ' v ', count: 2 });
        await deleteVariantAction({ group: ' A ', variant: ' v ' });
        await reorderVariantsAction({ group: ' A ', variants: { ' v ': 1 } });

        expect(getVariant).not.toHaveBeenCalled();
        expect(updateVariant).toHaveBeenCalledWith({ group: 'A', variant: 'v', count: 2 }, transactionSession);
        expect(deleteVariant).toHaveBeenCalledWith('A', 'v', transactionSession);
        expect(reorderVariants).toHaveBeenCalledWith('A', { v: 1 }, transactionSession);
    });

    it.each([
        () => updateVariantAction({ group: 'A', variant: 'v' }),
        () => renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' }),
        () => copyVariantAction({ group: 'A', variant: 'v', targetGroup: 'B' }),
        () => deleteVariantAction({ group: 'A', variant: 'v' }),
        () => reorderVariantsAction({ group: 'A', variants: { v: 1 } }),
    ])('authenticates before validating or accessing data', async (call) => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error(SchemaError.Unauthorized));

        await expect(call()).rejects.toThrow(SchemaError.Unauthorized);

        expect(getVariants).not.toHaveBeenCalled();
        expect(getVariant).not.toHaveBeenCalled();
        expect(updateVariant).not.toHaveBeenCalled();
        expect(renameVariant).not.toHaveBeenCalled();
        expect(copyVariant).not.toHaveBeenCalled();
        expect(deleteVariant).not.toHaveBeenCalled();
        expect(reorderVariants).not.toHaveBeenCalled();
    });
});

describe('variant action results', () => {
    beforeEach(() => vi.mocked(getVariants).mockResolvedValue([]));

    afterEach(() => vi.clearAllMocks());

    it('updates unchanged names without rewriting product references', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(true);

        await renameVariantAction({ group: 'A', variant: 'v', targetVariant: ' v ', suffix: '' });

        expect(updateVariant).toHaveBeenCalledWith(
            { group: 'A', variant: 'v', targetVariant: 'v', suffix: '' },
            transactionSession
        );
        expect(renameVariant).not.toHaveBeenCalled();
        expect(renameProductsVariant).not.toHaveBeenCalled();
    });

    it('renames product references with the same transaction session', async () => {
        vi.mocked(renameVariant).mockResolvedValueOnce(true);

        await renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' });

        expect(renameProductsVariant).toHaveBeenCalledExactlyOnceWith('A', 'v', 'new', transactionSession);
        expect(vi.mocked(renameVariant).mock.invocationCallOrder[0]).toBeLessThan(
            vi.mocked(renameProductsVariant).mock.invocationCallOrder[0]!
        );
    });

    it('propagates child rewrite failures to abort the transaction', async () => {
        vi.mocked(renameVariant).mockResolvedValueOnce(true);
        vi.mocked(renameProductsVariant).mockRejectedValueOnce(new Error('rewrite failed'));

        await expect(renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' })).rejects.toThrow(
            'rewrite failed'
        );
    });

    it('does not rewrite children when renaming has no effect', async () => {
        vi.mocked(renameVariant).mockResolvedValueOnce(false);

        await expect(renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' })).rejects.toThrow(
            SchemaError.RequestFailed
        );

        expect(renameProductsVariant).not.toHaveBeenCalled();
    });

    it('loads groups and variants together', async () => {
        const groups = [{ group: 'A', order: 0 }];
        const variants = [{ group: 'A', variant: 'v', order: 0 }];
        vi.mocked(getGroups).mockResolvedValueOnce(groups);
        vi.mocked(getVariants).mockResolvedValueOnce(variants);

        await expect(getVariantsAction()).resolves.toStrictEqual({ groups, variants });
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('reports a failed update', async () => {
        vi.mocked(updateVariant).mockResolvedValueOnce(false);

        await expect(updateVariantAction({ group: 'A', variant: 'v' })).rejects.toThrow(
            'The requested change could not be applied'
        );
    });

    it('forwards omitted rename fields for the data layer to resolve', async () => {
        vi.mocked(renameVariant).mockResolvedValueOnce(true);
        await renameVariantAction({ group: ' A ', variant: ' v ', targetVariant: ' new ', count: 4 });

        expect(renameVariant).toHaveBeenCalledWith(
            { group: 'A', variant: 'v', targetVariant: 'new', count: 4 },
            transactionSession
        );
    });

    it('reports a missing variant or failed rename', async () => {
        vi.mocked(renameVariant).mockRejectedValueOnce(new Error(SchemaError.NotFound)).mockResolvedValueOnce(false);

        await expect(renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' })).rejects.toThrow(
            SchemaError.NotFound
        );
        await expect(renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new' })).rejects.toThrow(
            SchemaError.RequestFailed
        );
    });

    it('forwards zero order and an empty suffix when renaming', async () => {
        vi.mocked(renameVariant).mockResolvedValueOnce(true);

        await renameVariantAction({ group: 'A', variant: 'v', targetVariant: 'new', order: 0, suffix: '' });

        expect(renameVariant).toHaveBeenCalledExactlyOnceWith(
            { group: 'A', variant: 'v', targetVariant: 'new', order: 0, suffix: '' },
            transactionSession
        );
    });

    it.each([
        [
            'copy',
            () =>
                copyVariantAction({
                    group: ' A ',
                    variant: ' v ',
                    targetGroup: ' B ',
                    targetVariant: ' new ',
                    count: 2,
                }),
            copyVariant,
            [{ group: 'A', variant: 'v', targetGroup: 'B', targetVariant: 'new', count: 2 }, transactionSession],
        ],
        [
            'delete',
            () => deleteVariantAction({ group: 'A', variant: 'v' }),
            deleteVariant,
            ['A', 'v', transactionSession],
        ],
        [
            'reorder',
            () => reorderVariantsAction({ group: 'A', variants: { v: 2 } }),
            reorderVariants,
            ['A', { v: 2 }, transactionSession],
        ],
    ] as const)('%s forwards data and reports a failed write', async (_label, call, dataFunction, args) => {
        vi.mocked(dataFunction)
            .mockResolvedValueOnce(true as never)
            .mockResolvedValueOnce(false as never);
        await call();

        expect(dataFunction).toHaveBeenCalledWith(...args);
        await expect(call()).rejects.toThrow('The requested change could not be applied');
    });
});
