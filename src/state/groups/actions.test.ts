import { type Group } from '~/common/types';
import { deleteGroupAction, GroupsActionType, renameGroupAction, setGroupsAction, updateGroupAction } from '~/state/groups/actions';
import { getGroupsFixture } from '~/tests/fixtures';

describe('setGroupsAction', () => {
    it('returns valid action', () => {
        const groups = getGroupsFixture();
        expect(setGroupsAction(groups)).toEqual({ type: GroupsActionType.SET, groups });
    });

    it('returns valid action for empty set', () => {
        const groups: Group[] = [];
        expect(setGroupsAction(groups)).toEqual({ type: GroupsActionType.SET, groups });
    });
});

describe('updateGroupAction', () => {
    it('returns valid action', () => {
        expect(updateGroupAction('G', 2)).toEqual({
            type: GroupsActionType.UPDATE,
            group: 'G',
            order: 2,
        });
    });

    it('returns valid action for empty title', () => {
        expect(updateGroupAction('G', 2)).toEqual({
            type: GroupsActionType.UPDATE,
            group: 'G',
            order: 2,
        });
    });
});

describe('renameGroupAction', () => {
    it('returns valid action', () => {
        expect(renameGroupAction('G', 'H')).toEqual({
            type: GroupsActionType.RENAME,
            group: 'G',
            newGroup: 'H',
        });
    });
});

describe('deleteGroupAction', () => {
    it('returns valid action', () => {
        expect(deleteGroupAction('G')).toEqual({
            type: GroupsActionType.DELETE,
            group: 'G',
        });
    });
});
