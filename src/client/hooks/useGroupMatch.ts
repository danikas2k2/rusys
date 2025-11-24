import { useProducts } from '~/client/state/products/useProducts';

export function useGroupMatch(group: string): boolean {
    const groupMatch = group.trim().toLowerCase();
    return Object.keys(useProducts() ?? {}).some((g) => g.toLowerCase() === groupMatch);
}
