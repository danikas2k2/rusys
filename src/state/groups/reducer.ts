import { type Group } from '~/common/types';
import { GroupsActionType, type GroupsAction } from '~/state/groups/actions';
import { cloneDeep } from 'lodash';

export function groups(state: ReadonlyArray<Group> = [], action: GroupsAction): ReadonlyArray<Group> {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        default:
            return state;
    }
}
