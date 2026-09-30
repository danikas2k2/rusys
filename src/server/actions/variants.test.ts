import {
    copyVariantAction,
    deleteVariantAction,
    getVariantsAction,
    renameVariantAction,
    reorderVariantsAction,
    saveVariant,
} from '~/server/actions/variants';
import { requireSession } from '~/server/auth/session';
import { renameVariantOccurrences } from '~/server/data/common';
import { getGroups } from '~/server/data/groups';
import {
    copyVariant,
    deleteVariant,
    getVariant,
    getVariants,
    reorderVariants,
    updateVariant,
} from '~/server/data/variants';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/data/groups'));

describe('saveVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('preserves omitted fields when updating an existing variant', async () => {
        vi.mocked(getVariant).mockResolvedValue({
            group: 'Uogienės',
            variant: 'p',
            order: 2,
            suffix: 'l',
            count: 4,
            units: 'kg',
        });
        vi.mocked(updateVariant).mockResolvedValue(true);

        await saveVariant('Uogienės', 'p', { count: 5 });

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(updateVariant).toHaveBeenCalledExactlyOnceWith('Uogienės', 'p', {
            order: 2,
            suffix: 'l',
            count: 5,
            units: 'kg',
        });
    });

    it('does not mutate without a session', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(saveVariant('Uogienės', 'p', {})).rejects.toThrow('Unauthorized');

        expect(updateVariant).not.toHaveBeenCalled();
    });
});

describe('variant action validation', () => {
    afterEach(() => vi.clearAllMocks());

    it.each([
        ['variant fields', () => saveVariant('A', 'v', { count: NaN }), updateVariant],
        ['variant name', () => renameVariantAction('A', 'v', 42 as never), renameVariantOccurrences],
        [
            'copied variant fields',
            () => copyVariantAction('A', 'v', 'B', undefined, { units: 'invalid' as never }),
            copyVariant,
        ],
        ['deleted variant identity', () => deleteVariantAction('A', 42 as never), deleteVariant],
        ['variant order', () => reorderVariantsAction('A', { v: NaN }), reorderVariants],
    ] as const)('rejects invalid %s before accessing data', async (_label, call, dataFunction) => {
        await expect(call()).rejects.toBeInstanceOf(Error);

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(dataFunction).not.toHaveBeenCalled();
    });

    it('accepts a valid variant order map', async () => {
        vi.mocked(reorderVariants).mockResolvedValueOnce(true);

        await reorderVariantsAction('A', { v: 1.5 });

        expect(reorderVariants).toHaveBeenCalledExactlyOnceWith('A', { v: 1.5 });
    });
});

describe('variant action results', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads groups and variants together', async () => {
        const groups = [{ group: 'A', order: 0 }];
        const variants = [{ group: 'A', variant: 'v', order: 0 }];
        vi.mocked(getGroups).mockResolvedValueOnce(groups);
        vi.mocked(getVariants).mockResolvedValueOnce(variants);

        await expect(getVariantsAction()).resolves.toStrictEqual({ groups, variants });
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('reports a failed update', async () => {
        vi.mocked(getVariant).mockResolvedValueOnce(undefined);
        vi.mocked(updateVariant).mockResolvedValueOnce(false);

        await expect(saveVariant('A', 'v', {})).rejects.toThrow('The requested change could not be applied');
    });

    it('renames a variant using existing values for omitted fields', async () => {
        vi.mocked(getVariant).mockResolvedValueOnce({
            group: 'A',
            variant: 'v',
            order: 2,
            suffix: 'kg',
            count: 3,
            units: 'kg',
        });
        vi.mocked(renameVariantOccurrences).mockResolvedValueOnce(true);
        await renameVariantAction('A', 'v', 'new', { count: 4 });

        expect(renameVariantOccurrences).toHaveBeenCalledWith('A', 'v', 'new', {
            order: 2,
            suffix: 'kg',
            count: 4,
            units: 'kg',
        });
    });

    it('reports a missing variant or failed rename', async () => {
        vi.mocked(getVariant)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ group: 'A', variant: 'v', order: 0 });
        vi.mocked(renameVariantOccurrences).mockResolvedValueOnce(false);

        await expect(renameVariantAction('A', 'v', 'new')).rejects.toThrow('Variant not found');
        await expect(renameVariantAction('A', 'v', 'new')).rejects.toThrow('The variant could not be renamed');
    });

    it.each([
        [
            'copy',
            () => copyVariantAction('A', 'v', 'B', 'new', { count: 2 }),
            copyVariant,
            ['A', 'v', 'B', 'new', { count: 2 }],
        ],
        ['delete', () => deleteVariantAction('A', 'v'), deleteVariant, ['A', 'v']],
        ['reorder', () => reorderVariantsAction('A', { v: 2 }), reorderVariants, ['A', { v: 2 }]],
    ] as const)('%s forwards data and reports a failed write', async (_label, call, dataFunction, args) => {
        vi.mocked(dataFunction)
            .mockResolvedValueOnce(true as never)
            .mockResolvedValueOnce(false as never);
        await call();

        expect(dataFunction).toHaveBeenCalledWith(...args);
        await expect(call()).rejects.toThrow('The requested change could not be applied');
    });
});
