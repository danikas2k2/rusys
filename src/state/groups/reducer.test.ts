import { type GroupsAction, GroupsActionType } from '~/state/groups/actions';
import { groups as reducer } from '~/state/groups/reducer';
import { getGroupsFixture } from '~/tests/fixtures';

describe('groups', () => {
    const groups = getGroupsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as GroupsActionType } as GroupsAction;

        it('leave set unchanged', () => {
            expect(reducer(groups, unknownAction)).toEqual(groups);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toEqual(groups);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.SET,
                    groups: [],
                })
            ).toEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(groups.slice(0, 1), {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toEqual(groups);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toEqual(groups);
        });
    });
});
