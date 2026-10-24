import z from 'zod';

import { SchemaError } from '~/schema/errors';
import { validGroupName } from '~/schema/groups';
import { validProductName } from '~/schema/products';
import { validVariantName } from '~/schema/variants';
import { validYear } from '~/schema/year';

/**
 * Strict stock change row with a normalized variant and a finite, signed quantity (zero is allowed).
 * Optional metadata distinguishes recycled/consumed changes, suspicious stock, home stock, and expiry buckets.
 * Expiry accepts a finite epoch-millisecond number without enforcing an integer or a date range.
 */
export const variantAmountSchema = z.strictObject({
    variant: validVariantName,
    amount: z.number(SchemaError.InvalidRequest),
    recycled: z.boolean(SchemaError.InvalidRequest).optional(),
    suspicious: z.boolean(SchemaError.InvalidRequest).optional(),
    home: z.boolean(SchemaError.InvalidRequest).optional(),
    expiresAt: z.number(SchemaError.InvalidRequest).optional(),
});
export type VariantAmount = z.infer<typeof variantAmountSchema>;

/** Nonempty stock change list, frozen by Zod after parsing; duplicate variant rows are allowed. */
export const variantAmounts = z.array(variantAmountSchema).min(1, SchemaError.AmountsRequired).readonly();

/** Yearly stock snapshot; zero is the combined-year bucket and an empty, readonly amount list is valid. */
export const yearAmountsSchema = z.object({
    year: validYear,
    amounts: z.array(variantAmountSchema).readonly(),
});
export type YearAmounts = z.infer<typeof yearAmountsSchema>;

/** Yearly stock snapshot with an optional removing flag; no flag is defaulted during parsing. */
export const removingYearAmountsSchema = yearAmountsSchema.extend({ removing: z.boolean().optional() });
export type RemovingYearAmounts = z.infer<typeof removingYearAmountsSchema>;

/** Group quantity projection with optional readonly stock rows; the stored group string is preserved verbatim. */
export const groupAmountsSchema = z.object({
    group: validGroupName,
    amounts: z.array(variantAmountSchema).readonly().optional(),
});
export type GroupAmounts = z.infer<typeof groupAmountsSchema>;

/** Product quantity projection with a numeric year and optional image references; empty amount lists are valid. */
export const productAmountsSchema = groupAmountsSchema.extend({
    name: validProductName,
    year: validYear,
    image: z.string().optional(),
    photo: z.string().optional(),
});
export type ProductAmounts = z.infer<typeof productAmountsSchema>;
