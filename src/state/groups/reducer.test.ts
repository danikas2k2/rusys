import { getGroupsFixture } from '@tests/fixtures';
import { GroupsActionType, type GroupsAction } from '~/state/groups/actions';
import { groups as reducer } from '~/state/groups/reducer';

describe('groups', () => {
    const groups = getGroupsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as GroupsActionType } as GroupsAction;

        it('leave set unchanged', () => {
            expect(reducer(groups, unknownAction)).toStrictEqual(groups);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toStrictEqual(groups);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.SET,
                    groups: [],
                })
            ).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(groups.slice(0, 1), {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toStrictEqual(groups);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupsActionType.SET,
                    groups,
                })
            ).toStrictEqual(groups);
        });
    });
});
