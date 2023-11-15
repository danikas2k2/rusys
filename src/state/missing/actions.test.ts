import {
    addMissingAction,
    MissingActionType,
    removeMissingAction,
    removeMissingGroupAction,
    setMissingAction,
} from '~/state/missing/actions';

describe('setMissingAction', () => {
    it('returns valid action', () => {
        const missing = ['A', { group: 'G', name: 'B' }];
        expect(setMissingAction(missing)).toEqual({
            type: MissingActionType.SET,
            missing,
        });
    });

    it('returns valid action for empty set', () => {
        expect(setMissingAction([])).toEqual({
            type: MissingActionType.SET,
            missing: [],
        });
    });
});

describe('addMissingAction', () => {
    it('returns valid action', () => {
        expect(addMissingAction('G', 'A')).toEqual({
            type: MissingActionType.ADD,
            group: 'G',
            name: 'A',
        });
    });

    it('returns valid action for empty name', () => {
        expect(addMissingAction('G', '')).toEqual({
            type: MissingActionType.ADD,
            group: 'G',
            name: '',
        });
    });

    it('returns valid action for empty group', () => {
        expect(addMissingAction('', 'A')).toEqual({
            type: MissingActionType.ADD,
            group: '',
            name: 'A',
        });
    });

    it('returns valid action for empty group and name', () => {
        expect(addMissingAction('', '')).toEqual({
            type: MissingActionType.ADD,
            group: '',
            name: '',
        });
    });
});

describe('removeMissingAction', () => {
    it('returns valid action', () => {
        expect(removeMissingAction('G', 'A')).toEqual({
            type: MissingActionType.REMOVE,
            group: 'G',
            name: 'A',
        });
    });

    it('returns valid action for empty name', () => {
        expect(removeMissingAction('G', '')).toEqual({
            type: MissingActionType.REMOVE,
            group: 'G',
            name: '',
        });
    });

    it('returns valid action for empty group', () => {
        expect(removeMissingAction('', 'A')).toEqual({
            type: MissingActionType.REMOVE,
            group: '',
            name: 'A',
        });
    });

    it('returns valid action for empty group and name', () => {
        expect(removeMissingAction('', '')).toEqual({
            type: MissingActionType.REMOVE,
            group: '',
            name: '',
        });
    });
});

describe('removeMissingGroupAction', () => {
    it('returns valid action', () => {
        expect(removeMissingGroupAction('G')).toEqual({
            type: MissingActionType.REMOVE_GROUP,
            group: 'G',
        });
    });

    it('returns valid action for empty group', () => {
        expect(removeMissingGroupAction('')).toEqual({
            type: MissingActionType.REMOVE_GROUP,
            group: '',
        });
    });
});
