import { getDetailsFixture } from '@tests/fixtures';
import { DetailsActionType, type DetailsAction } from '~/state/details/actions';
import { details as reducer } from '~/state/details/reducer';
import { cloneDeep, set } from 'lodash';

describe('details', () => {
    const details = getDetailsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as DetailsActionType } as DetailsAction;

        it('leave set unchanged', () => {
            expect(reducer(details, unknownAction)).toStrictEqual(details);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('updates empty state', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toStrictEqual(details);
        });

        it('updates empty state with empty set', () => {
            expect(
                reducer([], {
                    type: DetailsActionType.SET,
                    details: [],
                })
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer([{ group: 'G', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }] }], {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toStrictEqual(details);
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET,
                    details,
                })
            ).toStrictEqual(details);
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
            ).toStrictEqual([]);
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
            ).toStrictEqual(set(cloneDeep(details), '[1].years[0].removing', true));
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
            ).toStrictEqual(set(cloneDeep(details), '[3].years[0].removing', undefined));
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
            ).toStrictEqual(details);
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
            ).toStrictEqual(details);
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
            ).toStrictEqual(details);
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
            ).toStrictEqual([]);
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
            ).toStrictEqual([]);
        });

        it('updates filled state', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'Uogienės',
                    name: 'Avietės',
                    missing: true,
                })
            ).toStrictEqual(set(cloneDeep(details), '[0].missing', true));
        });

        it('updates filled state using false', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'Daržovės',
                    name: 'Agurkai',
                    missing: false,
                })
            ).toStrictEqual(set(cloneDeep(details), '[2].missing', undefined));
        });

        it('does not update filled state using missing name', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'B',
                    missing: true,
                })
            ).toStrictEqual(details);
        });

        it('does not update filled state using missing group', () => {
            expect(
                reducer(details, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'H',
                    name: 'A',
                    missing: true,
                })
            ).toStrictEqual(details);
        });

        it('does not update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: DetailsActionType.SET_MISSING,
                    group: 'G',
                    name: 'A',
                    missing: true,
                })
            ).toStrictEqual([]);
        });
    });
});
