import { getGroupsFixture } from '@tests/fixtures';

import { GroupsActionType, setGroupsAction } from '~/client/state/groups/actions';
import type { Group } from '~/common/data';

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
