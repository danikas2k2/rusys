import { clearFilterAction, FilterActionType, setFilterAction } from '~/state/filter/actions';

describe('setFilterAction', () => {
    it('returns valid action', () => {
        expect(setFilterAction('filtered')).toStrictEqual({
            type: FilterActionType.SET,
            filter: 'filtered',
        });
    });

    it('returns valid action for empty set', () => {
        expect(setFilterAction('')).toStrictEqual({
            type: FilterActionType.SET,
            filter: '',
        });
    });
});

describe('clearFilterAction', () => {
    it('returns valid action', () => {
        expect(clearFilterAction()).toStrictEqual({
            type: FilterActionType.CLEAR,
        });
    });
});
