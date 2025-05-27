import { useSelector } from 'react-redux';
import { type WithGroupsState } from '~/state/groups/types';
import { type Group } from '~/types/data';
import { isEqual } from 'lodash';

export function useGroups(): ReadonlyArray<Group> {
    return useSelector((state: WithGroupsState) => state.groups ?? [], isEqual);
}
