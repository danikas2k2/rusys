import { clearGroupAction, GroupActionType, setGroupAction } from '~/state/group/actions';

describe('setGroupAction', () => {
    it('returns valid action', () => {
        expect(setGroupAction('grouped')).toStrictEqual({
            type: GroupActionType.SET,
            group: 'grouped',
        });
    });

    it('returns valid action for empty set', () => {
        expect(setGroupAction('')).toStrictEqual({
            type: GroupActionType.SET,
            group: '',
        });
    });
});

describe('clearGroupAction', () => {
    it('returns valid action', () => {
        expect(clearGroupAction()).toStrictEqual({
            type: GroupActionType.CLEAR,
        });
    });
});
