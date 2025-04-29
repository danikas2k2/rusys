import { GroupActionType, type GroupAction } from '~/state/group/actions';

export function group(state: string = '', action: Readonly<GroupAction>): string {
    switch (action.type) {
        case GroupActionType.SET:
            return action.group;

        case GroupActionType.CLEAR:
            return '';

        default:
            return state;
    }
}
