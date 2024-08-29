import { cloneDeep } from 'lodash';
import { type Group } from '~/common/types';
import { type GroupsAction, GroupsActionType } from '~/state/groups/actions';

export function groups(groups: ReadonlyArray<Group> = [], action: GroupsAction): ReadonlyArray<Group> {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        default:
            return groups;
    }
}
