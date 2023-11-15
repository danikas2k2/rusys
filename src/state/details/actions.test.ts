import {
    DetailsActionType,
    moveDetailsAction,
    removeDetailsAction,
    removeGroupAction,
    renameDetailsAction,
    renameGroupAction,
    setDetailsAction,
    updateDetailsAction,
} from '~/state/details/actions';
import { type AmountSet } from '~/state/details/types';

describe('setDetailsAction', () => {
    it('returns valid action', () => {
        const details: AmountSet = { G: { A: { 21: { '': 1 }, 22: { '': 2, d: 3 } } } };
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });

    it('returns valid action for empty set', () => {
        const details = {};
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });
});

describe('updateDetailsAction', () => {
    it('returns valid action', () => {
        expect(updateDetailsAction('G', 'A', 21, { d: 2 })).toEqual({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            value: { d: 2 },
        });
    });

    it('returns valid action for empty value', () => {
        expect(updateDetailsAction('G', 'A', 21, {})).toEqual({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            value: {},
        });
    });

    it('returns valid action for undefined value', () => {
        expect(updateDetailsAction('G', 'A', 21)).toEqual({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
        });
    });

    it('returns valid action for undefined year and value', () => {
        expect(updateDetailsAction('G', 'A')).toEqual({
            type: DetailsActionType.UPDATE,
            group: 'G',
            name: 'A',
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

describe('renameGroupAction', () => {
    it('returns valid action', () => {
        expect(renameGroupAction('G', 'H')).toEqual({
            type: DetailsActionType.RENAME_GROUP,
            group: 'G',
            newGroup: 'H',
        });
    });
});

describe('removeDetailsAction', () => {
    it('returns valid action', () => {
        expect(removeDetailsAction('G', 'A')).toEqual({
            type: DetailsActionType.REMOVE,
            group: 'G',
            name: 'A',
        });
    });
});

describe('removeGroupAction', () => {
    it('returns valid action', () => {
        expect(removeGroupAction('G')).toEqual({
            type: DetailsActionType.REMOVE_GROUP,
            group: 'G',
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
