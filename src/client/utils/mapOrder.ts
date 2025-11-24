export function mapOrder<T>(items: readonly T[], key: (item: T) => string): Record<string, number> {
    return items.entries().reduce<Record<string, number>>((r, [index, item]) => ({ ...r, [key(item)]: index }), {});
}
