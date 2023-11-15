import { RemovingActionType, setRemovingAction, updateRemovingAction } from '~/state/removing/actions';
import { type RemovingSet } from '~/state/removing/types';

describe('setRemovingAction', () => {
    it('returns valid action', () => {
        const removing: RemovingSet = { G: { A: { 21: true, 22: true } } };
        expect(setRemovingAction(removing)).toEqual({ type: RemovingActionType.SET, removing });
    });

    it('returns valid action for empty set', () => {
        const removing = {};
        expect(setRemovingAction(removing)).toEqual({ type: RemovingActionType.SET, removing });
    });
});

describe('updateRemovingAction', () => {
    it('returns valid action', () => {
        expect(updateRemovingAction('G', 'A', 21, true)).toEqual({
            type: RemovingActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            removing: true,
        });
    });

    it('returns valid action for empty value', () => {
        expect(updateRemovingAction('G', 'A', 21, false)).toEqual({
            type: RemovingActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            removing: false,
        });
    });
});
