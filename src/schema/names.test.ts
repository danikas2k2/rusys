import { SchemaError } from '~/schema/errors';
import {
    optionalVariantName,
    parentProductName,
    validGroupName,
    validProductName,
    validVariantName,
    variantName,
} from '~/schema/names';

describe('shared name schemas', () => {
    it.each([
        {
            name: 'group',
            schema: validGroupName,
            invalid: SchemaError.CategoryInvalid,
            required: SchemaError.CategoryRequired,
        },
        {
            name: 'product',
            schema: validProductName,
            invalid: SchemaError.ProductNameInvalid,
            required: SchemaError.NameRequired,
        },
        {
            name: 'variant',
            schema: validVariantName,
            invalid: SchemaError.VariantInvalid,
            required: SchemaError.VariantRequired,
        },
    ])('preserves normalization and domain errors for required $name names', ({ schema, invalid, required }) => {
        expect(schema.parse(' A  B ')).toBe('A  B');
        expect(schema.safeParse(1).error?.issues[0].message).toBe(invalid);
        expect(schema.safeParse('bad:name').error?.issues[0].message).toBe(SchemaError.InvalidCharacter);

        for (const value of ['', '   ']) {
            expect(schema.safeParse(value).error?.issues[0].message).toBe(required);
        }
    });

    it('allows exactly an empty parent selection or a valid normalized product name', () => {
        expect(parentProductName.parse('')).toBe('');
        expect(parentProductName.parse(' A  B ')).toBe('A  B');
        expect(parentProductName.safeParse('   ').success).toBe(false);
        expect(parentProductName.safeParse('bad:name').success).toBe(false);
    });

    it('keeps base/optional variant names distinct from required names', () => {
        expect(variantName.parse('   ')).toBe('');
        expect(optionalVariantName.parse(' A  B ')).toBe('A  B');

        for (const value of [undefined, '', '   ']) {
            expect(optionalVariantName.parse(value)).toBeUndefined();
        }

        expect(optionalVariantName.safeParse('bad:name').success).toBe(false);
    });
});
