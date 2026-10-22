import z from 'zod';

import { deriveVariantKey } from '~/lib/utils/deriveVariantKey';
import { SchemaError } from '~/schema/errors';
import { groupIdentity, validGroupName } from '~/schema/groups';

export const variantName = z
    .string(SchemaError.VariantInvalid)
    .trim()
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);
export const validVariantName = variantName.nonempty(SchemaError.VariantRequired);
export const optionalVariantName = variantName.optional().transform((value) => value || undefined);

export const variantIdentity = groupIdentity.safeExtend({ variant: validVariantName });
export type VariantIdentity = z.infer<typeof variantIdentity>;

export const DEFAULT_UNITS: VariantUnits = 'vnt';

export const variantUnits = z.enum(['g', 'kg', 'l', 'ml', 'vnt']);
export type VariantUnits = z.infer<typeof variantUnits>;

export const updateVariant = variantIdentity.safeExtend({
    order: z.number(SchemaError.InvalidRequest).optional(),
    suffix: z.string(SchemaError.InvalidRequest).optional(),
    count: z.number(SchemaError.InvalidRequest).min(0.001, SchemaError.InvalidRequest).optional(),
    units: variantUnits.optional(),
});
export type UpdateVariant = z.infer<typeof updateVariant>;

export const renameVariant = updateVariant.extend({
    targetVariant: validVariantName,
});
export type RenameVariant = z.infer<typeof renameVariant>;

export const copyVariant = updateVariant.extend({
    targetGroup: validGroupName,
    targetVariant: optionalVariantName,
});
export type CopyVariant = z.infer<typeof copyVariant>;

export const deleteVariant = variantIdentity;
export type DeleteVariant = z.infer<typeof deleteVariant>;

export const reorderVariants = groupIdentity.safeExtend({
    variants: z.record(validVariantName, z.number()).refine((value) => Object.keys(value).length > 0),
});
export type ReorderVariants = z.infer<typeof reorderVariants>;

const variantCreationFields = updateVariant.omit({ variant: true }).safeExtend({
    name: optionalVariantName,
    units: variantUnits.default(DEFAULT_UNITS),
});

export const createVariant = variantCreationFields
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
export type CreateVariant = z.input<typeof createVariant>;
