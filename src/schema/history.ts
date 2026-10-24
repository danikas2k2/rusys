import z from 'zod';

import { groupAmountsSchema, yearAmountsSchema } from '~/schema/amounts';

/** Recorded stock change with an epoch-millisecond time and readonly yearly rows; optional audit text stays optional. */
export const updateSchema = z.object({
    time: z.number(),
    user: z.string().optional(),
    comment: z.string().optional(),
    years: z.array(yearAmountsSchema).readonly(),
});
export type Update = z.infer<typeof updateSchema>;

/** Flattened history projection retaining its group and optional stock rows, plus product and audit information. */
export const historySchema = groupAmountsSchema.extend({
    sessionId: z.string().optional(),
    time: z.number(),
    name: z.string(),
    year: z.number().optional(),
    user: z.string().optional(),
    comment: z.string().optional(),
});
export type History = z.infer<typeof historySchema>;

/** Loaded change and undo history; both lists may be empty and are frozen after parsing. */
export const productHistorySchema = z.object({
    updates: z.array(historySchema).readonly(),
    undates: z.array(historySchema).readonly(),
});
export type ProductHistory = z.infer<typeof productHistorySchema>;

/**
 * A history list contains full updates or year-only markers, rather than a mixture of the two shapes.
 * Strict metadata entries prevent full updates with extra fields from being silently reduced to markers.
 */
export const productHistoryEntries = z.union([
    z.array(updateSchema).readonly(),
    z.array(z.strictObject({ year: z.number() })).readonly(),
]);

/**
 * Client-only loaded history indexed by numeric year; never persisted.
 * Object keys arrive as strings in JavaScript, so numeric keys are parsed before validating the readonly record.
 */
export const productHistoryCache = z
    .record(z.string().trim().nonempty().pipe(z.coerce.number<string>()), productHistorySchema)
    .readonly();
