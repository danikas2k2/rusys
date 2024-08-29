import { type GroupAction, GroupActionType } from '~/state/group/actions';
import { group as reducer } from '~/state/group/reducer';

describe('group', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as GroupActionType } as GroupAction;

        it('leave set unchanged', () => {
            expect(reducer('grouped', unknownAction)).toEqual('grouped');
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
                    type: GroupActionType.SET,
                    group: 'grouped',
                })
            ).toEqual('grouped');
        });

        it('update empty state with empty set', () => {
            expect(
                reducer('', {
                    type: GroupActionType.SET,
                    group: '',
                })
            ).toEqual('');
        });

        it('update filled state', () => {
            expect(
                reducer('grouped', {
                    type: GroupActionType.SET,
                    group: 'updated',
                })
            ).toEqual('updated');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupActionType.SET,
                    group: 'grouped',
                })
            ).toEqual('grouped');
        });
    });

    describe('clear', () => {
        it('return updated state', () => {
            expect(
                reducer('grouped', {
                    type: GroupActionType.CLEAR,
                })
            ).toEqual('');
        });

        it('return updated undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupActionType.CLEAR,
                })
            ).toEqual('');
        });
    });
});
