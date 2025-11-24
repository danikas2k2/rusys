import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithGroupsState } from '~/client/state/groups/types';

export function useIsAnnual(group: string): boolean {
    return useSelector(
        (state: WithGroupsState) => state.groups?.find((g) => g.group === group)?.annual ?? true,
        isEqual
    );
}
