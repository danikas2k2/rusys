import { useMemo } from 'react';

import { useGroupComparator } from '~/client/state/groups/useGroupComparator';

export function useUniqueGroups(records: readonly { group: string }[]): readonly string[] {
    const compareGroups = useGroupComparator();
    return useMemo(
        () =>
            records
                .reduce<string[]>((acc, { group }) => (acc.includes(group) ? acc : [...acc, group]), [])
                .sort((a, b) => compareGroups(a, b)),
        [compareGroups, records]
    );
}
