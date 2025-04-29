export function getChangedIndexes(before: string[], after: string[]): Record<string, number> {
    return Object.fromEntries(after.map((v, i) => [v, i] as const).filter(([v], i) => i !== before.indexOf(v)));
}
