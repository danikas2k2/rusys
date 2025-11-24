import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithGroupsState } from '~/client/state/groups/types';
import type { Group } from '~/types/data';

export function useGroups(): readonly Group[] {
    return useSelector((state: WithGroupsState) => state.groups ?? [], isEqual);
}
