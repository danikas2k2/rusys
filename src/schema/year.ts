import z from 'zod';

import { SchemaError } from '~/schema/errors';

export const validYear = z
    .number(SchemaError.InvalidYear)
    .int(SchemaError.InvalidYear)
    // TODO check if min may be increased to 2000
    .min(0, SchemaError.InvalidYear);

export type Year = z.infer<typeof validYear>;
