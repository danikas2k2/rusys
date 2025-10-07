import { useDetails } from '~/client/state/details/useDetails';

export function useGroupMatch(group: string): boolean {
    const groupMatch = group.trim().toLowerCase();
    return Object.keys(useDetails() ?? {}).some((g) => g.toLowerCase() === groupMatch);
}
