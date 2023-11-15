// TODO should group also be filtered?
import { compareGroups } from '~/client/utils/compareGroups';
import { filterNamedEntries } from '~/client/utils/filterNamedEntries';
import { type Group, type GroupedSet, type Name } from '~/state/types';

export function filterGroupedEntries<T>(set: GroupedSet<T>, filter: string): [Group, [Name, T][]][] {
    return Object.entries(set)
        .map<[Group, [Name, T][]]>(([group, amounts]) => [group, filterNamedEntries(amounts, filter)])
        .filter(([, amounts]) => amounts.length)
        .sort(([a], [b]) => compareGroups(a, b));
}
