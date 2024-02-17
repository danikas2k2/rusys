import { type Details, type VariantAmount, type YearAmounts } from '~/common/types';
import {
    deleteDetailsAction,
    DetailsActionType,
    moveDetailsAction,
    renameDetailsAction,
    setDetailsAction,
    setDetailsAmountsAction,
    setDetailsYearsAction,
} from '~/state/details/actions';
import { getTestDetails } from '~/tests/fixtures';

describe('setDetailsAction', () => {
    it('returns valid action', () => {
        const details = getTestDetails();
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });

    it('returns valid action for empty set', () => {
        const details: Details[] = [];
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });
});

describe('updateDetailsYearsAction', () => {
    it('returns valid action', () => {
        const years: YearAmounts[] = [{ year: 21, amounts: [{ variant: 'd', amount: 2 }] }];
        expect(setDetailsYearsAction('G', 'A', years)).toEqual({
            type: DetailsActionType.SET_YEARS,
            group: 'G',
            name: 'A',
            years,
        });
    });

    it('returns valid action for empty value', () => {
        expect(setDetailsYearsAction('G', 'A', [])).toEqual({
            type: DetailsActionType.SET_YEARS,
            group: 'G',
            name: 'A',
            years: [],
        });
    });

    it('returns valid action for undefined value', () => {
        expect(setDetailsYearsAction('G', 'A')).toEqual({
            type: DetailsActionType.SET_YEARS,
            group: 'G',
            name: 'A',
        });
    });
});

describe('updateDetailsVariantsAction', () => {
    it('returns valid action', () => {
        const amounts: VariantAmount[] = [{ variant: 'd', amount: 2 }];
        expect(setDetailsAmountsAction('G', 'A', 21, amounts)).toEqual({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
            amounts,
        });
    });

    it('returns valid action for empty value', () => {
        expect(setDetailsAmountsAction('G', 'A', 21, [])).toEqual({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
            amounts: [],
        });
    });

    it('returns valid action for undefined value', () => {
        expect(setDetailsAmountsAction('G', 'A', 21)).toEqual({
            type: DetailsActionType.SET_AMOUNTS,
            group: 'G',
            name: 'A',
            year: 21,
        });
    });
});

describe('renameDetailsAction', () => {
    it('returns valid action', () => {
        expect(renameDetailsAction('G', 'A', 'B')).toEqual({
            type: DetailsActionType.RENAME,
            group: 'G',
            name: 'A',
            newName: 'B',
        });
    });
});

describe('deleteDetailsAction', () => {
    it('returns valid action', () => {
        expect(deleteDetailsAction('G', 'A')).toEqual({
            type: DetailsActionType.DELETE,
            group: 'G',
            name: 'A',
        });
    });
});

describe('moveDetailsAction', () => {
    it('returns valid action', () => {
        expect(moveDetailsAction('G', 'A', 'H')).toEqual({
            type: DetailsActionType.MOVE,
            group: 'G',
            name: 'A',
            newGroup: 'H',
        });
    });
});
