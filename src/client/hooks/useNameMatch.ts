import { useDetails } from '~/state/details/useDetails';
import { type Group, type Name } from '~/state/types';

export function useNameMatch(group: Group, name: Name): boolean {
    const nameMatch = name.trim().toLowerCase();
    const groupMatch = group.trim().toLowerCase();
    const details = useDetails();
    return Object.keys(details ?? {}).some(
        (g) =>
            g.toLowerCase() === groupMatch && Object.keys(details?.[g] ?? {}).some((n) => n.toLowerCase() === nameMatch)
    );
}
