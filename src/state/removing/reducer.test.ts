import { type RemovingAction, RemovingActionType } from '~/state/removing/actions';
import reducer from '~/state/removing/reducer';
import { type RemovingSet } from '~/state/removing/types';

describe('removing', () => {
    const state: RemovingSet = {
        '': { A: { 21: true }, B: { 22: true } },
        G: { A: { 22: true }, C: { 21: true } },
    };

    describe('default', () => {
        const unknownAction = { type: 'unknown' as RemovingActionType } as RemovingAction;

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
                        type: RemovingActionType.SET,
                        removing: state,
                    }
                )
            ).toEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer(
                    {},
                    {
                        type: RemovingActionType.SET,
                        removing: {},
                    }
                )
            ).toEqual({});
        });

        it('update filled state', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.SET,
                        removing: state,
                    }
                )
            ).toEqual(state);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: RemovingActionType.SET,
                    removing: state,
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
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        removing: true,
                    }
                )
            ).toEqual({ G: { A: { 21: true } } });
        });

        it('update empty state using no value', () => {
            expect(
                reducer(
                    {},
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        removing: false,
                    }
                )
            ).toEqual({ G: { A: {} } });
        });

        it('update filled state', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        removing: false,
                    }
                )
            ).toEqual({ G: { A: {} } });
        });

        it('leave unchanged if nothing to update', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        removing: true,
                    }
                )
            ).toEqual({ G: { A: { 21: true } } });
        });

        it('update filled state using different year', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 22,
                        removing: true,
                    }
                )
            ).toEqual({ G: { A: { 21: true, 22: true } } });
        });

        it('update filled state using different name', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'B',
                        year: 21,
                        removing: true,
                    }
                )
            ).toEqual({ G: { A: { 21: true }, B: { 21: true } } });
        });

        it('update filled state using different group', () => {
            expect(
                reducer(
                    { G: { A: { 21: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'H',
                        name: 'A',
                        year: 21,
                        removing: true,
                    }
                )
            ).toEqual({ G: { A: { 21: true } }, H: { A: { 21: true } } });
        });

        it('update filled state using no value', () => {
            expect(
                reducer(
                    { G: { A: { 21: true, 22: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 21,
                        removing: false,
                    }
                )
            ).toEqual({ G: { A: { 22: true } } });
        });

        it('update filled state using no value and different year', () => {
            expect(
                reducer(
                    { G: { A: { 21: true, 22: true } } },
                    {
                        type: RemovingActionType.UPDATE,
                        group: 'G',
                        name: 'A',
                        year: 22,
                        removing: false,
                    }
                )
            ).toEqual({ G: { A: { 21: true } } });
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: RemovingActionType.UPDATE,
                    group: 'G',
                    name: 'A',
                    year: 21,
                    removing: true,
                })
            ).toEqual({ G: { A: { 21: true } } });
        });
    });
});
