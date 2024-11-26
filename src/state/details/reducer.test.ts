import { cloneDeep, set } from 'lodash';
import { type DetailsAction, DetailsActionType } from '~/state/details/actions';
import { details as reducer } from '~/state/details/reducer';
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

    describe('set removing', () => {
        it('does not update empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    year: 21,
                    removing: true,
                })
            ).toEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'Uogienės',
                    name: 'Braškės',
                    year: 22,
                    removing: true,
                })
            ).toEqual(set(cloneDeep(details), '[1].years[0].removing', true));
        });

        it('updates filled state with false', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_REMOVING,
                    group: 'Daržovės',
                    name: 'Kopūstai',
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
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toEqual(set(cloneDeep(details), '[0].missing', true));
        });

        it('updates filled state using false', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'Daržovės',
                    name: 'Agurkai',
                    missing: false,
                })
            ).toEqual(set(cloneDeep(details), '[2].missing', undefined));
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
});
