import { useDetails } from '~/state/details/useDetails';
import { type Group } from '~/state/types';

export function useGroupMatch(group: Group): boolean {
    const groupMatch = group.trim().toLowerCase();
    return Object.keys(useDetails() ?? {}).some((g) => g.toLowerCase() === groupMatch);
}
