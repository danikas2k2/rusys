import z from 'zod';

import { parseExpiryTolerance } from '~/common/utils/expiry';
import { compare } from '~/lib/utils/names';
import { SchemaError } from '~/schema/errors';
import { groupIdentity, validGroupName } from '~/schema/groups';
import { validVariantName } from '~/schema/variants';
import { validYear } from '~/schema/year';

export const validProductName = z
    .string(SchemaError.ProductNameInvalid)
    .trim()
    .nonempty(SchemaError.NameRequired)
    .regex(/^[^:]*$/, SchemaError.InvalidCharacter);

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

export const productIdentity = groupIdentity.safeExtend({
    name: validProductName,
});
export type ProductIdentity = z.infer<typeof productIdentity>;

export const updateProduct = productIdentity.extend({
    parent: validProductName.or(z.literal('')),
    image: z.string(SchemaError.InvalidRequest),
    expiryTolerance: z
        .string(SchemaError.InvalidExpiryTolerance)
        .refine((value) => parseExpiryTolerance(value) !== undefined, SchemaError.InvalidExpiryTolerance),
});
export type UpdateProduct = z.infer<typeof updateProduct>;

const positiveAmount = z.number(SchemaError.AmountRequired).positive(SchemaError.AmountRequired);

export const consumedAmount = z.strictObject({
    amount: positiveAmount,
});
export type ConsumedAmount = z.infer<typeof consumedAmount>;

export const moveFlagsSchema = z
    .strictObject({
        suspicious: z.boolean(SchemaError.InvalidRequest),
        home: z.boolean(SchemaError.InvalidRequest),
        expiresAt: z.number(SchemaError.InvalidRequest),
    })
    .partial();

export const variantAmount = z.strictObject({
    variant: validVariantName,
    amount: z.number(SchemaError.InvalidRequest),
    recycled: z.boolean(SchemaError.InvalidRequest).optional(),
    suspicious: z.boolean(SchemaError.InvalidRequest).optional(),
    home: z.boolean(SchemaError.InvalidRequest).optional(),
    expiresAt: z.number(SchemaError.InvalidRequest).optional(),
});

export type VariantAmount = z.infer<typeof variantAmount>;

export const variantAmounts = z.array(variantAmount).min(1, SchemaError.AmountsRequired).readonly();

export const deleteProduct = productIdentity;
export type DeleteProduct = ProductIdentity;

export const renameProduct = productIdentity.safeExtend({ targetName: validProductName });
export type RenameProduct = z.infer<typeof renameProduct>;

export const moveProduct = productIdentity.safeExtend({
    targetGroup: validGroupName,
    targetName: validProductName.optional(),
});
export type MoveProduct = z.infer<typeof moveProduct>;

export const setProductParent = productIdentity.safeExtend({ parent: validProductName.optional() });
export type SetProductParent = z.infer<typeof setProductParent>;

export const addProduct = setProductParent;
export type AddProduct = SetProductParent;

export const setProductExpiryTolerance = productIdentity.safeExtend({
    days: z
        .number(SchemaError.ExpiryToleranceDaysInvalid)
        .int(SchemaError.ExpiryToleranceDaysInvalid)
        .min(0, SchemaError.ExpiryToleranceDaysInvalid),
});
export type SetProductExpiryTolerance = z.infer<typeof setProductExpiryTolerance>;

export const setProductMissing = productIdentity.safeExtend({
    missing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductMissing = z.infer<typeof setProductMissing>;

export const applyReview = z.strictObject({
    updates: z.array(setProductMissing).min(1, SchemaError.ReviewUpdatesInvalid).readonly(),
});
export type ApplyReview = z.infer<typeof applyReview>;

export const productYearIdentity = productIdentity.safeExtend({ year: validYear });
export type ProductYearIdentity = z.infer<typeof productYearIdentity>;

export const setProductRemoving = productYearIdentity.safeExtend({
    removing: z.boolean(SchemaError.InvalidRequest),
});
export type SetProductRemoving = z.infer<typeof setProductRemoving>;

export const setProductImage = productIdentity.safeExtend({
    image: z.string(SchemaError.InvalidRequest),
});
export type SetProductImage = z.infer<typeof setProductImage>;

export const setVariantImage = productIdentity.safeExtend({
    variant: validVariantName,
    image: z.string(SchemaError.InvalidRequest),
});
export type SetVariantImage = z.infer<typeof setVariantImage>;

export const setAmounts = productYearIdentity.safeExtend({
    comment: z.string(SchemaError.InvalidRequest).optional(),
    amounts: variantAmounts,
});
export type SetAmounts = z.infer<typeof setAmounts>;

export const transferAmounts = setAmounts
    .safeExtend({
        targetGroup: validGroupName,
        targetName: validProductName,
    })
    .refine(({ amounts }) => amounts.every(({ amount }) => amount > 0), SchemaError.VariantAndPositiveAmountRequired);
export type TransferAmounts = z.infer<typeof transferAmounts>;

export const moveConsumedToRecycled = productYearIdentity.safeExtend({
    variant: validVariantName,
    amount: positiveAmount,
    flags: moveFlagsSchema.optional(),
});
export type MoveConsumedToRecycled = z.infer<typeof moveConsumedToRecycled>;
