import z from 'zod';

import { SchemaError } from '~/schema/errors';

export const loginWithGoogle = z.strictObject({
    token: z.string(SchemaError.InvalidLogin).min(1, SchemaError.InvalidLogin),
    kind: z.enum(['id', 'access'], SchemaError.InvalidLogin),
});
export type LoginWithGoogle = z.infer<typeof loginWithGoogle>;
