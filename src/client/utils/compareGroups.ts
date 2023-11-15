import { type Group } from '~/state/types';

// TODO groups should be sorted by custom order (need to be implemented)
export function compareGroups(a: Group, b: Group): number {
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
}
