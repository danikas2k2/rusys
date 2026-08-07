import type { Product } from '~/types/data';

// Walks the parent -> children map to gather every descendant (at any depth) of `name`, in no
// particular order. Shared by the table (rolled-up totals for a collapsed row) and the grid
// (rolled-up totals for a collapsed tile).
export function collectDescendants(name: string, childrenByParent: ReadonlyMap<string, readonly Product[]>): Product[] {
    const descendants: Product[] = [];
    const stack = [name];
    while (stack.length) {
        for (const child of childrenByParent.get(stack.pop()!) ?? []) {
            descendants.push(child);
            stack.push(child.name);
        }
    }
    return descendants;
}
