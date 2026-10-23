import z from 'zod';

import { SchemaError } from '~/schema/errors';

/**
 * Accepts a non-negative integer without coercion from strings.
 * Zero is supported for stock operations that combine years; no calendar-year minimum is enforced.
 */
export const validYear = z
    .number(SchemaError.InvalidYear)
    .int(SchemaError.InvalidYear)
    // TODO check if min may be increased to 2000
    .min(0, SchemaError.InvalidYear);

export type Year = z.infer<typeof validYear>;
