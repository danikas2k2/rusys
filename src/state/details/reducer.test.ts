import { type DetailsAction, DetailsActionType } from '~/state/details/actions';
import reducer from '~/state/details/reducer';
import { type AmountSet } from '~/state/details/types';

describe('details', () => {
    const state: AmountSet = {
        '': {
            A: { 21: { '': 2 } },
            B: { 22: { '': 1 } },
        },
        G: {
            A: { 22: { d: 1 } },
            C: { 21: { '': 2 } },
        },
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as DetailsActionType } as DetailsAction;

        it('leave set unchanged', () => {
            expect(reducer(state, unknownAction)).toEqual(state);
        });

        it('leave empty set unchanged', () => {
            expect(reducer({}, unknownAction)).toEqual({});
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual({});
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: DetailsActionType.SET,
                        details: state,
                    }
                )
            ).toEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer(
                    {},
                    {
                        type: DetailsActionType.SET,
                        details: {},
                    }
                )
            ).toEqual({});
        });

        it('update filled state', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.SET,
                        details: state,
                    }
                )
            ).toEqual(state);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET,
                    details: state,
                })
            ).toEqual(state);
        });
    });

    describe('update', () => {
        it('update empty state', () => {
            expect(
                reducer(
                    {},
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        value: { '': 1 },
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 } } } });
        });

        it('update empty state using no value', () => {
            expect(
                reducer(
                    {},
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                    }
                )
            ).toEqual({ G: { A: {} } });
        });

        it('update empty state using no year and value', () => {
            expect(
                reducer(
                    {},
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                    }
                )
            ).toEqual({ G: { A: {} } });
        });

        it('update filled state', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        value: { '': 2 },
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 2 } } } });
        });

        it('update filled state using different variant', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        value: { d: 1 },
                    }
                )
            ).toEqual({ G: { A: { 21: { d: 1 } } } });
        });

        it('update filled state using different year', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 22,
                        value: { '': 1 },
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 }, 22: { '': 1 } } } });
        });

        it('update filled state using different name', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'B',
                        year: 21,
                        value: { '': 1 },
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 } }, B: { 21: { '': 1 } } } });
        });

        it('update filled state using different group', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'H',
                        name: 'A',
                        year: 21,
                        value: { '': 1 },
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 } } }, H: { A: { 21: { '': 1 } } } });
        });

        it('update filled state using no value', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 }, 22: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                    }
                )
            ).toEqual({ G: { A: { 22: { '': 1 } } } });
        });

        it('update filled state using no value and different year', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 }, 22: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 22,
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 } } } });
        });

        it('update filled state using no year and value', () => {
            expect(
                reducer(
                    { G: { A: { 21: { '': 1 }, 22: { '': 1 } } } },
                    {
                        type: DetailsActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                    }
                )
            ).toEqual({ G: { A: { 21: { '': 1 }, 22: { '': 1 } } } });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.UPDATE,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    value: { '': 1 },
                })
            ).toEqual({ G: { A: { 21: { '': 1 } } } });
        });
    });

    describe('rename', () => {
        it('return updated state', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'B',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    B: { 22: { d: 1 } },
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('return updated state if target name already exists', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'C',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    C: { 21: { '': 2 }, 22: { d: 1 } },
                },
            });
        });

        it('leave set unchanged if same name', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'A',
                    newName: 'A',
                })
            ).toEqual(state);
        });

        it('leave set unchanged if name not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME,
                    group: 'G',
                    name: 'B',
                    newName: 'D',
                })
            ).toEqual(state);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME,
                    group: 'H',
                    name: 'A',
                    newName: 'B',
                })
            ).toEqual(state);
        });
    });

    describe('rename group', () => {
        it('return updated state', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME_GROUP,
                    group: 'G',
                    newGroup: 'H',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                H: {
                    A: { 22: { d: 1 } },
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('return updated state if target group already exists', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME_GROUP,
                    group: 'G',
                    newGroup: '',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 }, 22: { d: 1 } },
                    B: { 22: { '': 1 } },
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('leave set unchanged if same group', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME_GROUP,
                    group: 'G',
                    newGroup: 'G',
                })
            ).toEqual(state);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.RENAME_GROUP,
                    group: 'H',
                    newGroup: 'G',
                })
            ).toEqual(state);
        });
    });

    describe('remove', () => {
        it('return updated state', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.REMOVE,
                    group: 'G',
                    name: 'A',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('leave set unchanged if name not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.REMOVE,
                    group: 'G',
                    name: 'B',
                })
            ).toEqual(state);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.REMOVE,
                    group: 'H',
                    name: 'A',
                })
            ).toEqual(state);
        });
    });

    describe('remove group', () => {
        it('return updated state', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.REMOVE_GROUP,
                    group: 'G',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
            });
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.REMOVE_GROUP,
                    group: 'H',
                })
            ).toEqual(state);
        });
    });

    describe('move', () => {
        it('return updated state when moving to missing group', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: 'H',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    C: { 21: { '': 2 } },
                },
                H: {
                    A: { 22: { d: 1 } },
                },
            });
        });

        it('return updated state when moving to existing group with missing name', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'C',
                    newGroup: '',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                    C: { 21: { '': 2 } },
                },
                G: {
                    A: { 22: { d: 1 } },
                },
            });
        });

        it('return updated state when moving to existing group with existing name', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: '',
                })
            ).toEqual({
                '': {
                    A: { 21: { '': 2 }, 22: { d: 1 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('return updated state when moving to existing group with existing name and duplicated values', () => {
            expect(
                reducer(
                    {
                        '': {
                            A: { 22: { '': 2 } },
                            B: { 22: { '': 1 } },
                        },
                        G: {
                            A: { 22: { '': 1, d: 1 } },
                            C: { 21: { '': 2 } },
                        },
                    },
                    {
                        type: DetailsActionType.MOVE,
                        group: 'G',
                        name: 'A',
                        newGroup: '',
                    }
                )
            ).toEqual({
                '': {
                    A: { 22: { '': 1, d: 1 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    C: { 21: { '': 2 } },
                },
            });
        });

        it('leave set unchanged if same group', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.MOVE,
                    group: 'G',
                    name: 'A',
                    newGroup: 'G',
                })
            ).toEqual(state);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(state, {
                    type: DetailsActionType.MOVE,
                    group: 'H',
                    name: 'A',
                    newGroup: 'G',
                })
            ).toEqual(state);
        });
    });
});
