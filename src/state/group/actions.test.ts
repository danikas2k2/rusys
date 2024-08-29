import { clearGroupAction, GroupActionType, setGroupAction } from '~/state/group/actions';

describe('setGroupAction', () => {
    it('returns valid action', () => {
        expect(setGroupAction('grouped')).toEqual({
            type: GroupActionType.SET,
            group: 'grouped',
        });
    });

    it('returns valid action for empty set', () => {
        expect(setGroupAction('')).toEqual({
            type: GroupActionType.SET,
            group: '',
        });
    });
});

describe('clearGroupAction', () => {
    it('returns valid action', () => {
        expect(clearGroupAction()).toEqual({
            type: GroupActionType.CLEAR,
        });
    });
});
