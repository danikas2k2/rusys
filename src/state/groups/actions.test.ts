import { getGroupsFixture } from '@tests/fixtures';
import { type Group } from '~/common/types';
import { GroupsActionType, setGroupsAction } from '~/state/groups/actions';

describe('setGroupsAction', () => {
    it('returns valid action', () => {
        const groups = getGroupsFixture();

        expect(setGroupsAction(groups)).toStrictEqual({ type: GroupsActionType.SET, groups });
    });

    it('returns valid action for empty set', () => {
        const groups: Group[] = [];

        expect(setGroupsAction(groups)).toStrictEqual({ type: GroupsActionType.SET, groups });
    });
});
