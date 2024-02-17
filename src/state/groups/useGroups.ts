import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Group } from '~/common/types';
import { type WithGroupsState } from '~/state/groups/types';

export function useGroups(): ReadonlyArray<Group> {
    return useSelector((state: WithGroupsState) => state.groups ?? [], isEqual);
}
