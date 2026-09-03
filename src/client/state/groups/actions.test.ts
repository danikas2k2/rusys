import { getGroupsFixture } from '@tests/fixtures';

import type { Group } from '@rusys/common/data';

import { GroupsActionType, setGroupsAction } from '~/client/state/groups/actions';

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
