import { useRemovingSet } from '~/state/removing/useRemovingSet';
import { type Group, type Name, type Year } from '~/state/types';
import { useYears } from '~/state/years/useYears';

export function useIsRemoving(group: Group, name: Name, year: Year): boolean {
    const years = useYears();
    return years.includes(year) && !!useRemovingSet(group, name)?.[year];
}
