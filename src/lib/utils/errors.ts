export function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'string') {
        return error;
    }
    return (error as Error)?.message || 'Unknown error occurred';
}
