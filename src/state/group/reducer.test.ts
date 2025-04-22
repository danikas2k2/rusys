import { GroupActionType, type GroupAction } from '~/state/group/actions';
import { group as reducer } from '~/state/group/reducer';

describe('group', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as GroupActionType } as GroupAction;

        it('leave set unchanged', () => {
            expect(reducer('grouped', unknownAction)).toBe('grouped');
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
                    type: GroupActionType.SET,
                    group: 'grouped',
                })
            ).toBe('grouped');
        });

        it('update empty state with empty set', () => {
            expect(
                reducer('', {
                    type: GroupActionType.SET,
                    group: '',
                })
            ).toBe('');
        });

        it('update filled state', () => {
            expect(
                reducer('grouped', {
                    type: GroupActionType.SET,
                    group: 'updated',
                })
            ).toBe('updated');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupActionType.SET,
                    group: 'grouped',
                })
            ).toBe('grouped');
        });
    });

    describe('clear', () => {
        it('return updated state', () => {
            expect(
                reducer('grouped', {
                    type: GroupActionType.CLEAR,
                })
            ).toBe('');
        });

        it('return updated undefined state', () => {
            expect(
                reducer(undefined, {
                    type: GroupActionType.CLEAR,
                })
            ).toBe('');
        });
    });
});
