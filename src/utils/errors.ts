export function getErrorMessage(error: unknown): string {
    return (error as Error)?.message || (error as string) || 'Unknown error occurred';
}
