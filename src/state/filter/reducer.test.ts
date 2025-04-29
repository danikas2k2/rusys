import { FilterActionType, type FilterAction } from '~/state/filter/actions';
import { filter as reducer } from '~/state/filter/reducer';

describe('filter', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as FilterActionType } as FilterAction;

        it('leave set unchanged', () => {
            expect(reducer('filtered', unknownAction)).toBe('filtered');
        });

        it('leave empty set unchanged', () => {
            expect(reducer('', unknownAction)).toBe('');
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toBe('');
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer('', {
                    type: FilterActionType.SET,
                    filter: 'filtered',
                })
            ).toBe('filtered');
        });

        it('update empty state with empty set', () => {
            expect(
                reducer('', {
                    type: FilterActionType.SET,
                    filter: '',
                })
            ).toBe('');
        });

        it('update filled state', () => {
            expect(
                reducer('filtered', {
                    type: FilterActionType.SET,
                    filter: 'updated',
                })
            ).toBe('updated');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: FilterActionType.SET,
                    filter: 'filtered',
                })
            ).toBe('filtered');
        });
    });

    describe('clear', () => {
        it('return updated state', () => {
            expect(
                reducer('filtered', {
                    type: FilterActionType.CLEAR,
                })
            ).toBe('');
        });

        it('return updated undefined state', () => {
            expect(
                reducer(undefined, {
                    type: FilterActionType.CLEAR,
                })
            ).toBe('');
        });
    });
});
