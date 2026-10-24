import z from 'zod';

import { parseExpiryTolerance } from '~/common/utils/expiry';
import { removingYearAmountsSchema, variantAmounts } from '~/schema/amounts';
import { SchemaError } from '~/schema/errors';
import { groupIdentitySchema, validGroupName } from '~/schema/groups';
import { productHistoryCache, productHistoryEntries } from '~/schema/history';
import { validVariantName } from '~/schema/variants';
import { validYear } from '~/schema/year';

/** Trims a product name, requires a nonempty result, and forbids the `:` identity separator. */
export const validProductName = z
    .string(SchemaError.ProductNameInvalid)
    .trim()
    .nonempty(SchemaError.NameRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/** Normalizes a product name for identity comparisons; trims, lowercases, and collapses whitespace. */
export const parentProductName = validProductName.or(z.literal(''));

/** Strict product identity with normalized group and product names; shared by product operation requests. */
export const productIdentitySchema = groupIdentitySchema.safeExtend({
    name: validProductName,
});
export type ProductIdentity = z.infer<typeof productIdentitySchema>;

/**
 * Product document/client projection; stored names remain unchanged and optional fields receive no defaults.
 * Stock and history lists are readonly. History entries may be full changes or year-only markers;
 * the loaded history cache belongs only to the client and is never persisted.
 */
export const productSchema = productIdentitySchema.safeExtend({
    parent: parentProductName.optional(),
    /** Additional usable days after expiresAt; request validation enforces whole, non-negative days separately. */
    expiryToleranceDays: z.number().optional(),
    years: z.array(removingYearAmountsSchema).readonly().optional(),
    missing: z.boolean().optional(),
    updates: productHistoryEntries.optional(),
    undates: productHistoryEntries.optional(),
    history: productHistoryCache.optional(),
    /** Icon-sized image: a generated thumbnail or an upload that already fits within 512 by 512 pixels. */
    image: z.string().optional(),
    /** Original larger or non-square photo, present only when the source image qualifies as a photo. */
    photo: z.string().optional(),
    variantImages: z.record(z.string(), z.string()).readonly().optional(),
    variantPhotos: z.record(z.string(), z.string()).readonly().optional(),
    /** Archiving preserves balances and change history for auditing instead of deleting the product. */
    archivedAt: z.number().optional(),
});
export type Product = z.infer<typeof productSchema>;

/**
 * Product editor form: requires parent, image, and human-readable expiry tolerance strings.
 * Parent may be empty to select no parent; image may be empty. Expiry tolerance must parse to whole days
 * (for example `14` or `2 sav`) but remains a string here; conversion happens before the server request.
 */
export const updateProductSchema = productIdentitySchema.extend({
    parent: parentProductName.optional(),
    image: z.string(SchemaError.InvalidRequest),
    expiryTolerance: z
        .string(SchemaError.InvalidExpiryTolerance)
        .refine((value) => parseExpiryTolerance(value) !== undefined, SchemaError.InvalidExpiryTolerance),
});
export type UpdateProduct = z.infer<typeof updateProductSchema>;

/** Finite amount greater than zero; fractional quantities are supported without numeric coercion. */
const positiveAmount = z.number(SchemaError.AmountRequired).positive(SchemaError.AmountRequired);

/** Consumption dialog input containing only a positive quantity. */
export const consumedAmountSchema = z.strictObject({
    amount: positiveAmount,
});
export type ConsumedAmount = z.infer<typeof consumedAmountSchema>;

/** Optional stock-row selectors for a consumption correction; expiry is a finite epoch-millisecond number. */
export const moveFlagsSchema = z
    .strictObject({
        suspicious: z.boolean(SchemaError.InvalidRequest),
        home: z.boolean(SchemaError.InvalidRequest),
        expiresAt: z.number(SchemaError.InvalidRequest),
    })
    .partial();

/** Product deletion request; uses the same strict identity validation as other product operations. */
export const deleteProductSchema = productIdentitySchema;
export type DeleteProduct = ProductIdentity;

/** Renames a product within its group to a required normalized target name. */
export const renameProductSchema = productIdentitySchema.safeExtend({ targetName: validProductName });
export type RenameProduct = z.infer<typeof renameProductSchema>;

/** Moves a product to a required group, with an optional new name; child/duplicate checks run separately. */
export const moveProductSchema = productIdentitySchema.safeExtend({
    targetGroup: validGroupName,
    targetName: validProductName.optional(),
});
export type MoveProduct = z.infer<typeof moveProductSchema>;

/** Sets a normalized parent name, or clears it when omitted/undefined; hierarchy checks run in the data layer. */
export const setProductParentSchema = productIdentitySchema.safeExtend({ parent: validProductName.optional() });
export type SetProductParent = z.infer<typeof setProductParentSchema>;

/** Product creation input with an optional parent; shares the strict parent-update request shape. */
export const addProductSchema = setProductParentSchema;
export type AddProduct = SetProductParent;

/** Sets expiry tolerance in non-negative whole days without coercion; zero clears the stored tolerance. */
export const setProductExpiryToleranceSchema = productIdentitySchema.safeExtend({
    days: z
        .number(SchemaError.ExpiryToleranceDaysInvalid)
        .int(SchemaError.ExpiryToleranceDaysInvalid)
        .min(0, SchemaError.ExpiryToleranceDaysInvalid),
});
export type SetProductExpiryTolerance = z.infer<typeof setProductExpiryToleranceSchema>;

/** Sets the product-wide missing status with an explicit boolean. */
export const setProductMissingSchema = productIdentitySchema.safeExtend({
    missing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductMissing = z.infer<typeof setProductMissingSchema>;

/** Strict bulk review request with at least one missing-status update; parsing freezes the updates array. */
export const applyReviewSchema = z.strictObject({
    updates: z.array(setProductMissingSchema).min(1, SchemaError.ReviewUpdatesInvalid).readonly(),
});
export type ApplyReview = z.infer<typeof applyReviewSchema>;

/** Strict product identity plus a non-negative integer year; zero is accepted for combined-year stock operations. */
export const productYearIdentitySchema = productIdentitySchema.safeExtend({ year: validYear });
export type ProductYearIdentity = z.infer<typeof productYearIdentitySchema>;

/** Sets a year's removing status; the shared year schema accepts zero, which the data operation rejects. */
export const setProductRemovingSchema = productYearIdentitySchema.safeExtend({
    removing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductRemoving = z.infer<typeof setProductRemovingSchema>;

/** Product image request; empty strings can clear the image, while image resolution runs in the data layer. */
export const setProductImageSchema = productIdentitySchema.safeExtend({
    image: z.string(SchemaError.InvalidRequest),
});
export type SetProductImage = z.infer<typeof setProductImageSchema>;

/** Sets a product-specific variant image using the same image-string rules as the main product image. */
export const setVariantImageSchema = productIdentitySchema.safeExtend({
    variant: validVariantName,
    image: z.string(SchemaError.InvalidRequest),
});
export type SetVariantImage = z.infer<typeof setVariantImageSchema>;

/** Applies a nonempty list of signed stock deltas for a product/year, with an optional history comment. */
export const setAmountsSchema = productYearIdentitySchema.safeExtend({
    comment: z.string(SchemaError.InvalidRequest).optional(),
    amounts: variantAmounts,
});
export type SetAmounts = z.infer<typeof setAmountsSchema>;

/**
 * Transfer request with a required target product and a strictly positive amount in every stock row.
 * Source/target existence, distinct identities, and available balances are checked by the data operation.
 */
export const transferAmountsSchema = setAmountsSchema
    .safeExtend({
        targetGroup: validGroupName,
        targetName: validProductName,
    })
    .refine(({ amounts }) => amounts.every(({ amount }) => amount > 0), SchemaError.VariantAndPositiveAmountRequired);
export type TransferAmounts = z.infer<typeof transferAmountsSchema>;

/** Reclassifies a positive consumed quantity as recycled for a variant, with optional stock-row selectors. */
export const moveConsumedToRecycledSchema = productYearIdentitySchema.safeExtend({
    variant: validVariantName,
    amount: positiveAmount,
    flags: moveFlagsSchema.optional(),
});
export type MoveConsumedToRecycled = z.infer<typeof moveConsumedToRecycledSchema>;
