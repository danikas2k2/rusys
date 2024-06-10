import { getGroupsFixture } from '~/tests/fixtures';
import { type GroupsAction, GroupsActionType } from '~/state/groups/actions';
import { groups as reducer } from '~/state/groups/reducer';

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

    describe('update', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.UPDATE,
                    group: 'G',
                    order: 1,
                })
            ).toEqual([{ group: 'G', order: 1 }]);
        });

        it('update empty state using no title', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.UPDATE,
                    group: 'G',
                    order: 3,
                })
            ).toEqual([{ group: 'G', order: 3 }]);
        });

        it('update filled state', () => {
            expect(
                reducer(groups.slice(0, 1), {
                    type: GroupsActionType.UPDATE,
                    group: 'G',
                    order: 1,
                })
            ).toEqual([{ group: 'G', order: 1 }]);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupsActionType.UPDATE,
                    group: 'G',
                    order: 3,
                })
            ).toEqual([{ group: 'G', order: 3 }]);
        });
    });

    describe('rename', () => {
        it('return updated state', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'H',
                })
            ).toEqual([
                { group: 'H', order: 2 },
                { group: 'J', order: 1 },
            ]);
        });

        it('leave set unchanged if target group already exists', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'J',
                })
            ).toEqual(groups);
        });

        it('leave set unchanged if same group', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'G',
                })
            ).toEqual(groups);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.RENAME,
                    group: 'H',
                    newGroup: 'G',
                })
            ).toEqual(groups);
        });
    });

    describe('delete', () => {
        it('return updated state', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.DELETE,
                    group: 'G',
                })
            ).toEqual(groups.slice(1));
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.DELETE,
                    group: 'H',
                })
            ).toEqual(groups);
        });
    });

    describe('reorder', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.REORDER,
                    groups: { G: 1, J: 2 },
                })
            ).toEqual([]);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: GroupsActionType.REORDER,
                    groups: {},
                })
            ).toEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.REORDER,
                    groups: { G: 1, J: 2 },
                })
            ).toEqual([
                { group: 'G', order: 1 },
                { group: 'J', order: 2 },
            ]);
        });

        it('update state', () => {
            expect(
                reducer(groups, {
                    type: GroupsActionType.REORDER,
                    groups: { G: 1, J: 2 },
                })
            ).toEqual([
                { group: 'G', order: 1 },
                { group: 'J', order: 2 },
            ]);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupsActionType.REORDER,
                    groups: { G: 1, J: 2 },
                })
            ).toEqual([]);
        });
    });
});
