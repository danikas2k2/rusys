import z from 'zod';

import { SchemaError } from '~/schema/errors';

/** Trims a group name, requires a nonempty result, and forbids the `:` identity separator. */
export const validGroupName = z
    .string(SchemaError.CategoryInvalid)
    .trim()
    .nonempty(SchemaError.CategoryRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/** Trims a product name, requires a nonempty result, and forbids the `:` identity separator. */
export const validProductName = z
    .string(SchemaError.ProductNameInvalid)
    .trim()
    .nonempty(SchemaError.NameRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/** Accepts an empty parent selection or applies the shared product-name normalization and validation. */
export const parentProductName = validProductName.or(z.literal(''));

/** Trims a variant name and forbids the `:` identity separator; an empty result is allowed at this base level. */
export const variantName = z
    .string(SchemaError.VariantInvalid)
    .trim()
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);
/** Required variant name after trimming. */
export const validVariantName = variantName.nonempty(SchemaError.VariantRequired);
/** Optional name that normalizes empty or whitespace-only input to undefined. */
export const optionalVariantName = variantName.optional().transform((value) => value || undefined);
