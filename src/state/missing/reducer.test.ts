import { type MissingAction, MissingActionType } from '~/state/missing/actions';
import reducer from '~/state/missing/reducer';
import { type Missing } from '~/state/missing/types';

describe('missing', () => {
    const missing: Missing = [
        { group: '', name: 'A' },
        { group: '', name: 'B' },
        { group: 'G', name: 'A' },
    ];

    describe('default', () => {
        const unknownAction = { type: 'unknown' as MissingActionType } as MissingAction;

        it('leave set unchanged', () => {
            expect(reducer(missing, unknownAction)).toEqual(missing);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toEqual([]);
        });

        it('return default missing for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual([]);
        });
    });

    describe('set', () => {
        it('update empty missing', () => {
            expect(
                reducer([], {
                    type: MissingActionType.SET,
                    missing,
                })
            ).toEqual(missing);
        });

        it('update empty missing with empty set', () => {
            expect(
                reducer([], {
                    type: MissingActionType.SET,
                    missing: [],
                })
            ).toEqual([]);
        });

        it('update filled missing', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.SET,
                    missing,
                })
            ).toEqual(missing);
        });

        it('update undefined missing', () => {
            expect(
                reducer(undefined, {
                    type: MissingActionType.SET,
                    missing,
                })
            ).toEqual(missing);
        });
    });

    describe('add', () => {
        it('return updated missing', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.ADD,
                    group: '',
                    name: 'C',
                })
            ).toEqual([
                { group: '', name: 'A' },
                { group: '', name: 'B' },
                { group: 'G', name: 'A' },
                { group: '', name: 'C' },
            ]);
        });

        it('leave set unchanged if group and name already exists', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.ADD,
                    group: '',
                    name: 'B',
                })
            ).toEqual(missing);
        });
    });

    describe('remove', () => {
        it('return updated missing', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.REMOVE,
                    group: 'G',
                    name: 'A',
                })
            ).toEqual([
                { group: '', name: 'A' },
                { group: '', name: 'B' },
            ]);
        });

        it('leave set unchanged if name not found', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.REMOVE,
                    group: 'G',
                    name: 'B',
                })
            ).toEqual(missing);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.REMOVE,
                    group: 'H',
                    name: 'A',
                })
            ).toEqual(missing);
        });
    });

    describe('remove group', () => {
        it('return updated missing', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.REMOVE_GROUP,
                    group: '',
                })
            ).toEqual([{ group: 'G', name: 'A' }]);
        });

        it('leave set unchanged if group not found', () => {
            expect(
                reducer(missing, {
                    type: MissingActionType.REMOVE_GROUP,
                    group: 'H',
                })
            ).toEqual(missing);
        });
    });
});
