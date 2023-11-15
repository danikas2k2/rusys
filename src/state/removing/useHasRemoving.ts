import { useRemovingSet } from '~/state/removing/useRemovingSet';
import { type Group, type Name } from '~/state/types';
import { useYears } from '~/state/years/useYears';

export function useHasRemoving(group: Group, name: Name): boolean {
    const years = useYears();
    const removing = useRemovingSet(group, name);
    return years.some((year) => removing?.[year]);
}
