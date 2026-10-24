import z from 'zod';

import { SchemaError } from '~/schema/errors';

/**
 * Google sign-in request with a nonempty token and its ID/access token kind; unknown fields are rejected.
 * Validates the request shape only; token verification and account access checks run on the server.
 */
export const loginWithGoogleSchema = z.strictObject({
    token: z.string(SchemaError.InvalidLogin).min(1, SchemaError.InvalidLogin),
    kind: z.enum(['id', 'access'], SchemaError.InvalidLogin),
});
export type LoginWithGoogle = z.infer<typeof loginWithGoogleSchema>;
