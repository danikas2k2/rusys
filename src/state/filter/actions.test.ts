import { clearFilterAction, FilterActionType, setFilterAction } from '~/state/filter/actions';

describe('setFilterAction', () => {
    it('returns valid action', () => {
        expect(setFilterAction('filtered')).toEqual({
            type: FilterActionType.SET,
            filter: 'filtered',
        });
    });

    it('returns valid action for empty set', () => {
        expect(setFilterAction('')).toEqual({
            type: FilterActionType.SET,
            filter: '',
        });
    });
});

describe('clearFilterAction', () => {
    it('returns valid action', () => {
        expect(clearFilterAction()).toEqual({
            type: FilterActionType.CLEAR,
        });
    });
});
