import { type FilterAction, FilterActionType } from '~/state/filter/actions';
import { filter as reducer } from '~/state/filter/reducer';

describe('filter', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as FilterActionType } as FilterAction;

        it('leave set unchanged', () => {
            expect(reducer('filtered', unknownAction)).toEqual('filtered');
        });

        it('leave empty set unchanged', () => {
            expect(reducer('', unknownAction)).toEqual('');
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual('');
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer('', {
                    type: FilterActionType.SET,
                    filter: 'filtered',
                })
            ).toEqual('filtered');
        });

        it('update empty state with empty set', () => {
            expect(
                reducer('', {
                    type: FilterActionType.SET,
                    filter: '',
                })
            ).toEqual('');
        });

        it('update filled state', () => {
            expect(
                reducer('filtered', {
                    type: FilterActionType.SET,
                    filter: 'updated',
                })
            ).toEqual('updated');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: FilterActionType.SET,
                    filter: 'filtered',
                })
            ).toEqual('filtered');
        });
    });

    describe('clear', () => {
        it('return updated state', () => {
            expect(
                reducer('filtered', {
                    type: FilterActionType.CLEAR,
                })
            ).toEqual('');
        });

        it('return updated undefined state', () => {
            expect(
                reducer(undefined, {
                    type: FilterActionType.CLEAR,
                })
            ).toEqual('');
        });
    });
});
