import type { Group } from '@rusys/common/data';
import { cloneDeep } from 'lodash';

import { GroupsActionType, type GroupsAction } from '~/client/state/groups/actions';

export function groups(state: readonly Group[] = [], action: GroupsAction): readonly Group[] {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        default:
            return state;
    }
}
