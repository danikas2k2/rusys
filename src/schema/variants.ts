import z from 'zod';

import { deriveVariantKey } from '~/lib/utils/deriveVariantKey';
import { SchemaError } from '~/schema/errors';
import { groupIdentitySchema, validGroupName } from '~/schema/groups';

/** Trims a variant name and forbids the `:` identity separator; an empty result is allowed at this base level. */
export const variantName = z
    .string(SchemaError.VariantInvalid)
    .trim()
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);
/** Required variant name after trimming. */
export const validVariantName = variantName.nonempty(SchemaError.VariantRequired);
/** Optional name that normalizes empty or whitespace-only input to undefined. */
export const optionalVariantName = variantName.optional().transform((value) => value || undefined);

/** Strict group/variant identity with both names normalized and unknown fields rejected. */
export const variantIdentitySchema = groupIdentitySchema.safeExtend({ variant: validVariantName });
export type VariantIdentity = z.infer<typeof variantIdentitySchema>;

/** Default unit for newly created variants (`vnt` means individual items). */
export const DEFAULT_UNITS: VariantUnits = 'vnt';

/** Supported mass, volume, and item-count units; accepts only the exact listed abbreviations. */
export const variantUnits = z.enum(['g', 'kg', 'l', 'ml', 'vnt']);
export type VariantUnits = z.infer<typeof variantUnits>;

/**
 * Variant document/projection with optional quantity metadata and usage/archive flags.
 * Unlike mutation requests, stored strings/counts are not normalized or constrained to creation limits;
 * omitted units remain omitted for compatibility with older documents.
 */
export const variantSchema = variantIdentitySchema.safeExtend({
    order: z.number(),
    suffix: z.string().optional(),
    count: z.number().optional(),
    units: variantUnits.optional(),
    used: z.boolean().optional(),
    archivedAt: z.number().optional(),
});
export type Variant = z.infer<typeof variantSchema>;

/**
 * Partial variant metadata update; omitted values stay omitted and identity-only requests are valid.
 * Order may be any finite number, suffix may be empty, and count must be at least 0.001 when provided.
 */
export const updateVariantSchema = variantIdentitySchema.safeExtend({
    order: z.number(SchemaError.InvalidRequest).optional(),
    suffix: z.string(SchemaError.InvalidRequest).optional(),
    count: z.number(SchemaError.InvalidRequest).min(0.001, SchemaError.InvalidRequest).optional(),
    units: variantUnits.optional(),
});
export type UpdateVariant = z.infer<typeof updateVariantSchema>;

/** Renames to a required normalized target variant, optionally updating metadata in the same request. */
export const renameVariantSchema = updateVariantSchema.extend({
    targetVariant: validVariantName,
});
export type RenameVariant = z.infer<typeof renameVariantSchema>;

/** Copies to a required group with optional metadata; an absent/blank target name lets the data layer reuse the source. */
export const copyVariantSchema = updateVariantSchema.extend({
    targetGroup: validGroupName,
    targetVariant: optionalVariantName,
});
export type CopyVariant = z.infer<typeof copyVariantSchema>;

/** Variant deletion request containing only the strict group/variant identity. */
export const deleteVariantSchema = variantIdentitySchema;
export type DeleteVariant = z.infer<typeof deleteVariantSchema>;

/**
 * Requires a nonempty map of normalized variant names to finite orders within a group.
 * Integer, non-negative, contiguous, and unique positions are not required.
 */
export const reorderVariantsSchema = groupIdentitySchema.safeExtend({
    variants: z.record(validVariantName, z.number()).refine((value) => Object.keys(value).length > 0),
});
export type ReorderVariants = z.infer<typeof reorderVariantsSchema>;

/** Creation fields use an optional display name instead of an existing identity and default omitted units to `vnt`. */
const variantCreationFields = updateVariantSchema.omit({ variant: true }).safeExtend({
    name: optionalVariantName,
    units: variantUnits.default(DEFAULT_UNITS),
});

/**
 * Requires a nonblank name or a count of at least 0.001; missing both reports errors on name and count.
 * Produces a `variant` key from the normalized name, or from count plus units (for example `500ml`).
 * The parsed output retains creation fields and includes default units; uniqueness is checked elsewhere.
 */
export const createVariantSchema = variantCreationFields
    .superRefine(({ name, count }, ctx) => {
        if (!name && count === undefined) {
            for (const field of ['name', 'count']) {
                ctx.addIssue({
                    code: 'custom',
                    path: [field],
                    message: SchemaError.VariantNameOrAmountRequired,
                });
            }
        }
    })
    .transform((data) => ({
        ...data,
        variant: data.name || deriveVariantKey(data.count, data.units),
    }));
/** Input before defaults/key generation; parsed output additionally contains the canonical `variant` key. */
export type CreateVariant = z.input<typeof createVariantSchema>;
