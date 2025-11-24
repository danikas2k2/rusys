import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithGroupsState } from '~/client/state/groups/types';
import type { Group } from '~/types/data';

export function useGroup(group: string): Readonly<Group> | undefined {
    return useSelector((state: WithGroupsState) => state.groups?.find((g) => g.group === group), isEqual);
}
