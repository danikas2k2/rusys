import { cloneDeep } from 'lodash';
import { type Group } from '~/common/types';
import { type GroupsAction, GroupsActionType } from '~/state/groups/actions';

export function groups(groups: ReadonlyArray<Group> = [], action: GroupsAction): ReadonlyArray<Group> {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        case GroupsActionType.SWITCH:
            return switchGroups(groups, action);

        case GroupsActionType.UPDATE:
            return updateGroup(groups, action);

        case GroupsActionType.RENAME:
            return renameGroup(groups, action);

        case GroupsActionType.DELETE:
            return groups.filter((d) => d.group !== action.group);

        default:
            return groups;
    }
}

function switchGroups(
    groups: ReadonlyArray<Group>,
    { group, oppositeGroup }: Extract<GroupsAction, { type: GroupsActionType.SWITCH }>
): ReadonlyArray<Group> {
    const order = groups.find((d) => d.group === group)?.order;
    if (order == null) {
        return groups;
    }
    const oppositeOrder = groups.find((d) => d.group === oppositeGroup)?.order;
    if (oppositeOrder == null) {
        return groups;
    }
    if (order === oppositeOrder) {
        return groups;
    }
    return groups.map((d) => {
        if (d.group === group) {
            return { ...d, order: oppositeOrder };
        }
        if (d.group === oppositeGroup) {
            return { ...d, order };
        }
        return d;
    });
}

function updateGroup(
    groups: ReadonlyArray<Group>,
    { group, order }: Extract<GroupsAction, { type: GroupsActionType.UPDATE }>
): ReadonlyArray<Group> {
    if (groups.some((d) => d.group === group)) {
        return groups.map((d) => (d.group !== group ? d : { ...d, order: order ?? d.order }));
    }
    return [...groups, { group, order: order ?? groups.length }];
}

function renameGroup(
    groups: ReadonlyArray<Group>,
    { group, newGroup }: Extract<GroupsAction, { type: GroupsActionType.RENAME }>
) {
    if (group === newGroup || groups.some((d) => d.group === newGroup)) {
        return groups;
    }
    return groups.map((d) => (d.group !== group ? d : { ...d, group: newGroup }));
}
