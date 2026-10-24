import { createVariantSchema, updateVariantSchema } from '~/schema';
import { renameVariantSchema, reorderVariantsSchema } from '~/schema/variants';

describe('variant rename schema', () => {
    it('parses targetVariant with optional metadata', () => {
        expect(
            renameVariantSchema.parse({ group: ' A ', variant: ' v ', targetVariant: ' new ', order: 0, suffix: '' })
        ).toStrictEqual({
            group: 'A',
            variant: 'v',
            targetVariant: 'new',
            order: 0,
            suffix: '',
        });
    });

    it('rejects the obsolete name field', () => {
        expect(renameVariantSchema.safeParse({ group: 'A', variant: 'v', name: 'new' }).success).toBe(false);
    });
});

describe('variant reorder schema', () => {
    it('accepts valid variant orders', () => {
        expect(reorderVariantsSchema.parse({ group: ' A ', variants: { Small: 0 } })).toStrictEqual({
            group: 'A',
            variants: { Small: 0 },
        });
    });

    it('rejects unknown reorder fields', () => {
        expect(reorderVariantsSchema.safeParse({ group: 'A', variants: { Small: 0 }, user: 'client' }).success).toBe(
            false
        );
    });
});

describe('variant creation and uniqueness schemas', () => {
    it.each([
        [{ group: ' A ', name: ' Pear ' }, 'Pear', 'vnt'],
        [{ group: 'A', count: 500, units: 'ml' }, '500ml', 'ml'],
        [{ group: 'A', count: 2 }, '2vnt', 'vnt'],
        [{ group: 'A', name: ' ', count: 2 }, '2vnt', 'vnt'],
        [{ group: 'A', name: 'Pear', count: 2, units: 'kg' }, 'Pear', 'kg'],
    ] as const)('creates a canonical identity from %j', (request, variant, units) => {
        expect(createVariantSchema.parse(request)).toMatchObject({ group: 'A', variant, units });
    });

    it.each([
        { group: 'A' },
        { group: 'A', name: ' ' },
        { group: 'A', count: 0 },
        { group: 'A', count: -1 },
        { group: 'A', count: NaN },
        { group: 'A', count: Infinity },
        { group: 'A', name: 'bad:name' },
    ])('rejects invalid creation input %j', (request) => {
        expect(createVariantSchema.safeParse(request).success).toBe(false);
    });

    it('keeps units omitted during partial updates and permits clearing the suffix', () => {
        expect(updateVariantSchema.parse({ group: 'A', variant: 'v', suffix: '' })).toStrictEqual({
            group: 'A',
            variant: 'v',
            suffix: '',
        });
    });
});
