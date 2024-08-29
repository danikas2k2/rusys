export function uniqueId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
