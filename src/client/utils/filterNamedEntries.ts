import { compareNames } from '~/client/utils/compareNames';
import { matchParts } from '~/client/utils/matchParts';
import { type Name } from '~/state/types';

export function filterNamedEntries<T>(namedAmounts: Record<Name, T>, filter: string): [Name, T][] {
    return Object.entries(namedAmounts)
        .filter(([name]) => matchParts(name, filter))
        .sort(([a], [b]) => compareNames(a, b));
}
