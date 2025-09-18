import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { type WithGroupsState } from '~/state/groups/types';
import { type Group } from '~/types/data';

export function useGroups(): ReadonlyArray<Group> {
    return useSelector((state: WithGroupsState) => state.groups ?? [], isEqual);
}
