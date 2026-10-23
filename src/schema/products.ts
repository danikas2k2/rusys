import z from 'zod';

import { parseExpiryTolerance } from '~/common/utils/expiry';
import { compare } from '~/lib/utils/names';
import { SchemaError } from '~/schema/errors';
import { groupIdentity, validGroupName } from '~/schema/groups';
import { validVariantName } from '~/schema/variants';
import { validYear } from '~/schema/year';

/** Trims a product name, requires a nonempty result, and forbids the `:` identity separator. */
export const validProductName = z
    .string(SchemaError.ProductNameInvalid)
    .trim()
    .nonempty(SchemaError.NameRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

/**
 * Builds arguments for a Zod refinement that reports category-local name collisions on `name`.
 * Ignores the original product by exact identity and compares remaining names/groups without case or outer spaces.
 * Uses the supplied product snapshot; server-side persistence must still enforce uniqueness.
 */
export const uniqueProduct = (
    initialGroup: string,
    initialName: string,
    products: readonly ProductIdentity[]
): [(data: ProductIdentity) => boolean, { path: PropertyKey[]; error: string }] => [
    ({ group, name }) =>
        !products.some(
            (product) =>
                !(product.group === initialGroup && product.name === initialName) &&
                compare(product.group, group) === 0 &&
                compare(product.name, name) === 0
        ),
    { path: ['name'], error: SchemaError.NameAlreadyExists },
];

/**
 * Builds a refinement that reports a group change when the original product has children in the supplied snapshot.
 * Exact group/parent matches are used; staying in the original group always passes this check.
 */
export const movableProduct = (
    initialGroup: string,
    initialName: string,
    products: readonly SetProductParent[]
): [(data: SetProductParent) => boolean, { path: PropertyKey[]; error: string }] => [
    ({ group }) =>
        group === initialGroup ||
        !products.some((product) => product.group === initialGroup && product.parent === initialName),
    { path: ['group'], error: SchemaError.CannotMoveProductWithChildren },
];

/** Strict product identity with normalized group and product names; shared by product operation requests. */
export const productIdentity = groupIdentity.safeExtend({
    name: validProductName,
});
export type ProductIdentity = z.infer<typeof productIdentity>;

/**
 * Product editor form: requires parent, image, and human-readable expiry tolerance strings.
 * Parent may be empty to select no parent; image may be empty. Expiry tolerance must parse to whole days
 * (for example `14` or `2 sav`) but remains a string here; conversion happens before the server request.
 */
export const updateProduct = productIdentity.extend({
    parent: validProductName.or(z.literal('')),
    image: z.string(SchemaError.InvalidRequest),
    expiryTolerance: z
        .string(SchemaError.InvalidExpiryTolerance)
        .refine((value) => parseExpiryTolerance(value) !== undefined, SchemaError.InvalidExpiryTolerance),
});
export type UpdateProduct = z.infer<typeof updateProduct>;

/** Finite amount greater than zero; fractional quantities are supported without numeric coercion. */
const positiveAmount = z.number(SchemaError.AmountRequired).positive(SchemaError.AmountRequired);

/** Consumption dialog input containing only a positive quantity. */
export const consumedAmount = z.strictObject({
    amount: positiveAmount,
});
export type ConsumedAmount = z.infer<typeof consumedAmount>;

/** Optional stock-row selectors for a consumption correction; expiry is a finite epoch-millisecond number. */
export const moveFlagsSchema = z
    .strictObject({
        suspicious: z.boolean(SchemaError.InvalidRequest),
        home: z.boolean(SchemaError.InvalidRequest),
        expiresAt: z.number(SchemaError.InvalidRequest),
    })
    .partial();

/**
 * Strict stock change row with a normalized variant and a finite, signed quantity (zero is allowed).
 * Optional metadata distinguishes recycled/consumed changes, suspicious stock, home stock, and expiry buckets.
 * Expiry accepts a finite epoch-millisecond number without enforcing an integer or a date range.
 */
export const variantAmount = z.strictObject({
    variant: validVariantName,
    amount: z.number(SchemaError.InvalidRequest),
    recycled: z.boolean(SchemaError.InvalidRequest).optional(),
    suspicious: z.boolean(SchemaError.InvalidRequest).optional(),
    home: z.boolean(SchemaError.InvalidRequest).optional(),
    expiresAt: z.number(SchemaError.InvalidRequest).optional(),
});

export type VariantAmount = z.infer<typeof variantAmount>;

/** Nonempty stock change list, frozen by Zod after parsing; duplicate variant rows are allowed. */
export const variantAmounts = z.array(variantAmount).min(1, SchemaError.AmountsRequired).readonly();

/** Product deletion request; uses the same strict identity validation as other product operations. */
export const deleteProduct = productIdentity;
export type DeleteProduct = ProductIdentity;

/** Renames a product within its group to a required normalized target name. */
export const renameProduct = productIdentity.safeExtend({ targetName: validProductName });
export type RenameProduct = z.infer<typeof renameProduct>;

/** Moves a product to a required group, with an optional new name; child/duplicate checks run separately. */
export const moveProduct = productIdentity.safeExtend({
    targetGroup: validGroupName,
    targetName: validProductName.optional(),
});
export type MoveProduct = z.infer<typeof moveProduct>;

/** Sets a normalized parent name, or clears it when omitted/undefined; hierarchy checks run in the data layer. */
export const setProductParent = productIdentity.safeExtend({ parent: validProductName.optional() });
export type SetProductParent = z.infer<typeof setProductParent>;

/** Product creation input with an optional parent; shares the strict parent-update request shape. */
export const addProduct = setProductParent;
export type AddProduct = SetProductParent;

/** Sets expiry tolerance in non-negative whole days without coercion; zero clears the stored tolerance. */
export const setProductExpiryTolerance = productIdentity.safeExtend({
    days: z
        .number(SchemaError.ExpiryToleranceDaysInvalid)
        .int(SchemaError.ExpiryToleranceDaysInvalid)
        .min(0, SchemaError.ExpiryToleranceDaysInvalid),
});
export type SetProductExpiryTolerance = z.infer<typeof setProductExpiryTolerance>;

/** Sets the product-wide missing status with an explicit boolean. */
export const setProductMissing = productIdentity.safeExtend({
    missing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductMissing = z.infer<typeof setProductMissing>;

/** Strict bulk review request with at least one missing-status update; parsing freezes the updates array. */
export const applyReview = z.strictObject({
    updates: z.array(setProductMissing).min(1, SchemaError.ReviewUpdatesInvalid).readonly(),
});
export type ApplyReview = z.infer<typeof applyReview>;

/** Strict product identity plus a non-negative integer year; zero is accepted for combined-year stock operations. */
export const productYearIdentity = productIdentity.safeExtend({ year: validYear });
export type ProductYearIdentity = z.infer<typeof productYearIdentity>;

/** Sets a year's removing status; the shared year schema accepts zero, which the data operation rejects. */
export const setProductRemoving = productYearIdentity.safeExtend({
    removing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductRemoving = z.infer<typeof setProductRemoving>;

/** Product image request; empty strings can clear the image, while image resolution runs in the data layer. */
export const setProductImage = productIdentity.safeExtend({
    image: z.string(SchemaError.InvalidRequest),
});
export type SetProductImage = z.infer<typeof setProductImage>;

/** Sets a product-specific variant image using the same image-string rules as the main product image. */
export const setVariantImage = productIdentity.safeExtend({
    variant: validVariantName,
    image: z.string(SchemaError.InvalidRequest),
});
export type SetVariantImage = z.infer<typeof setVariantImage>;

/** Applies a nonempty list of signed stock deltas for a product/year, with an optional history comment. */
export const setAmounts = productYearIdentity.safeExtend({
    comment: z.string(SchemaError.InvalidRequest).optional(),
    amounts: variantAmounts,
});
export type SetAmounts = z.infer<typeof setAmounts>;

/**
 * Transfer request with a required target product and a strictly positive amount in every stock row.
 * Source/target existence, distinct identities, and available balances are checked by the data operation.
 */
export const transferAmounts = setAmounts
    .safeExtend({
        targetGroup: validGroupName,
        targetName: validProductName,
    })
    .refine(({ amounts }) => amounts.every(({ amount }) => amount > 0), SchemaError.VariantAndPositiveAmountRequired);
export type TransferAmounts = z.infer<typeof transferAmounts>;

/** Reclassifies a positive consumed quantity as recycled for a variant, with optional stock-row selectors. */
export const moveConsumedToRecycled = productYearIdentity.safeExtend({
    variant: validVariantName,
    amount: positiveAmount,
    flags: moveFlagsSchema.optional(),
});
export type MoveConsumedToRecycled = z.infer<typeof moveConsumedToRecycled>;
