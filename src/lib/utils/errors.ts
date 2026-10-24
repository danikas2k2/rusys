import { isSchemaError, SchemaError, ZodError } from '~/schema';

export function getErrorMessage(cause: unknown): SchemaError {
    if (cause instanceof ZodError) {
        for (const issue of cause.issues) {
            if (isSchemaError(issue.message)) {
                return issue.message;
            }
        }
        return SchemaError.InvalidRequest;
    }

    const message = typeof cause === 'string' ? cause : cause instanceof Error ? cause.message : '';
    return isSchemaError(message) ? message : SchemaError.Unknown;
}
