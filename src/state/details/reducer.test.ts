import { cloneDeep, merge, set } from 'lodash';
import { type DetailsAction, DetailsActionType } from '~/state/details/actions';
import { details as reducer } from '~/state/details/reducer';
import { GroupsActionType } from '~/state/groups/actions';
import { getDetailsFixture } from '~/tests/fixtures';

describe('details', () => {
    const details = getDetailsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as DetailsActionType } as DetailsAction;

        it('leave set unchanged', () => {
            expect(reducer(details, unknownAction)).toEqual(details);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual([]);
        });
    });

    describe('set', () => {
        it('updates empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toEqual(details);
        });

        it('updates empty state with empty set', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET,
                    details: [],
                })
            ).toEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toEqual(details);
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toEqual(details);
        });
    });

    describe('set years', () => {
        it('updates empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });

        it('updates empty state using empty value', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [],
                })
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('updates empty state using no value', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                })
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('updates filled state', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] }]);
        });

        it('updates filled state using different variant', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }] }]);
        });

        it('updates filled state using different year', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
                })
            ).toEqual([
                {
                    group: 'G',
                    name: 'A',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
                },
            ]);
        });

        it('updates filled state using different name', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'B',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
                })
            ).toEqual([
                { group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
                { group: 'G', name: 'B', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });

        it('updates filled state using different group', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_YEARS,
                    group: 'H',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
                })
            ).toEqual([
                { group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
                { group: 'H', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });

        it('updates filled state using blank value', () => {
            expect(
                reducer(
                    [
                        {
                            group: 'G',
                            name: 'A',
                            years: [
                                { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                                { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                            ],
                        },
                    ],
                    {
                        type: DetailsActionType.SET_YEARS,
                        group: 'G',
                        name: 'A',
                        years: [],
                    }
                )
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('updates filled state using no value', () => {
            expect(
                reducer(
                    [
                        {
                            group: 'G',
                            name: 'A',
                            years: [
                                { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                                { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                            ],
                        },
                    ],
                    {
                        type: DetailsActionType.SET_YEARS,
                        group: 'G',
                        name: 'A',
                    }
                )
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET_YEARS,
                    group: 'G',
                    name: 'A',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });
    });

    describe('set amounts', () => {
        it('updates empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    amounts: [{ variant: 'p', amount: 1 }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });

        it('updates empty state using no value', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 21,
                })
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('updates filled state', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    amounts: [{ variant: 'p', amount: 2 }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] }]);
        });

        it('updates filled state using different variant', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    amounts: [{ variant: 'd', amount: 1 }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'd', amount: 1 }] }] }]);
        });

        it('updates filled state using different year', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 22,
                    amounts: [{ variant: 'p', amount: 1 }],
                })
            ).toEqual([
                {
                    group: 'G',
                    name: 'A',
                    years: [
                        { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                        { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                    ],
                },
            ]);
        });

        it('updates filled state using different name', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'B',
                    year: 21,
                    amounts: [{ variant: 'p', amount: 1 }],
                })
            ).toEqual([
                { group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
                { group: 'G', name: 'B', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });

        it('updates filled state using different group', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'H',
                    name: 'A',
                    year: 21,
                    amounts: [{ variant: 'p', amount: 1 }],
                })
            ).toEqual([
                { group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
                { group: 'H', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });

        it('updates filled state using no value', () => {
            expect(
                reducer(
                    [
                        {
                            group: 'G',
                            name: 'A',
                            years: [
                                { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                                { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                            ],
                        },
                    ],
                    {
                        type: DetailsActionType.SET_AMOUNTS,
                        group: 'G',
                        name: 'A',
                        year: 21,
                    }
                )
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });

        it('updates filled state using no value and different year', () => {
            expect(
                reducer(
                    [
                        {
                            group: 'G',
                            name: 'A',
                            years: [
                                { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                                { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                            ],
                        },
                    ],
                    {
                        type: DetailsActionType.SET_AMOUNTS,
                        group: 'G',
                        name: 'A',
                        year: 22,
                    }
                )
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET_AMOUNTS,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    amounts: [{ variant: 'p', amount: 1 }],
                })
            ).toEqual([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }]);
        });
    });

    describe('set removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    removing: true,
                })
            ).toEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'A',
                    year: 22,
                    removing: true,
                })
            ).toEqual(set(cloneDeep(details), '[2].years[0].removing', true));
        });

        it('updates filled state with false', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'C',
                    year: 21,
                    removing: false,
                })
            ).toEqual(set(cloneDeep(details), '[3].years[0].removing', undefined));
        });

        it('does not update filled state using missing year', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'A',
                    year: 23,
                    removing: true,
                })
            ).toEqual(details);
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'B',
                    year: 21,
                    removing: true,
                })
            ).toEqual(details);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'H',
                    name: 'A',
                    year: 21,
                    removing: true,
                })
            ).toEqual(details);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    removing: true,
                })
            ).toEqual([]);
        });
    });

    describe('set missing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'A',
                    missing: true,
                })
            ).toEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'A',
                    missing: true,
                })
            ).toEqual(set(cloneDeep(details), '[2].missing', true));
        });

        it('updates filled state using false', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'J',
                    name: 'B',
                    missing: false,
                })
            ).toEqual(set(cloneDeep(details), '[1].missing', undefined));
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'B',
                    missing: true,
                })
            ).toEqual(details);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'H',
                    name: 'A',
                    missing: true,
                })
            ).toEqual(details);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'A',
                    missing: true,
                })
            ).toEqual([]);
        });
    });

    describe('rename', () => {
        it('updates existing name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'B',
                })
            ).toEqual(set(cloneDeep(details), '[2].name', 'B'));
        });

        it('does not update if target name already exists', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'C',
                })
            ).toEqual(details);
        });

        it('does not update if same name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'A',
                })
            ).toEqual(details);
        });

        it('does not update if name not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'B',
                    newName: 'D',
                })
            ).toEqual(details);
        });

        it('does not update if group not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.RENAME,
                    group: 'H',
                    name: 'A',
                    newName: 'B',
                })
            ).toEqual(details);
        });
    });

    describe('rename group', () => {
        it('renames existing group', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'H',
                })
            ).toEqual(merge([], details, set({}, '[2].group', 'H'), set({}, '[3].group', 'H')));
        });

        it('does not rename if target group already exists', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'J',
                })
            ).toEqual(details);
        });

        it('does not rename if same group', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.RENAME,
                    group: 'G',
                    newGroup: 'G',
                })
            ).toEqual(details);
        });

        it('does not rename if group not found', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.RENAME,
                    group: 'H',
                    newGroup: 'G',
                })
            ).toEqual(details);
        });
    });

    describe('delete', () => {
        it('deletes existing name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.DELETE,
                    group: 'G',
                    name: 'A',
                })
            ).toEqual([...details.slice(0, 2), ...details.slice(3)]);
        });

        it('does not delete if name not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.DELETE,
                    group: 'G',
                    name: 'B',
                })
            ).toEqual(details);
        });

        it('does not delete if group not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.DELETE,
                    group: 'H',
                    name: 'A',
                })
            ).toEqual(details);
        });
    });

    describe('delete group', () => {
        it('deletes existing group', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.DELETE,
                    group: 'G',
                })
            ).toEqual(details.slice(0, 2));
        });

        it('does not delete if group not found', () => {
            expect(
                reducer(details, {
                    type: GroupsActionType.DELETE,
                    group: 'H',
                })
            ).toEqual(details);
        });
    });

    describe('move', () => {
        it('moves existing name from existing group to new group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: 'H',
                })
            ).toEqual([...details.slice(0, 2), { ...details[2], group: 'H' }, ...details.slice(3)]);
        });

        it('moves existing name from one existing group to another if there are no such name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'C',
                    newGroup: 'J',
                })
            ).toEqual([...details.slice(0, 3), { ...details[3], group: 'J' }]);
        });

        it('does not move when when name already exists in another group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: 'J',
                })
            ).toEqual(details);
        });

        it('does not move if same group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: 'G',
                })
            ).toEqual(details);
        });

        it('does not move if group not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'H',
                    name: 'A',
                    newGroup: 'G',
                })
            ).toEqual(details);
        });

        it('does not move if name not found', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'X',
                    newGroup: 'H',
                })
            ).toEqual(details);
        });
    });
});
