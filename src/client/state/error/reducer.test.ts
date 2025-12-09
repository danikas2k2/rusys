import { ErrorActionType, type ErrorAction } from '~/client/state/error/actions';
import { error as reducer } from '~/client/state/error/reducer';

describe('error', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as ErrorActionType } as ErrorAction;

        it('leaves set unchanged', () => {
            const state = { error: 'Test error' };

            expect(reducer(state, unknownAction)).toStrictEqual(state);
        });

        it('leaves empty set unchanged', () => {
            const state = { error: null };

            expect(reducer(state, unknownAction)).toStrictEqual(state);
        });

        it('returns default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual({ error: null });
        });
    });

    describe('set', () => {
        it('sets error in empty state', () => {
            expect(
                reducer(
                    { error: null },
                    {
                        type: ErrorActionType.SET,
                        error: 'Test error',
                    }
                )
            ).toStrictEqual({ error: 'Test error' });
        });

        it('updates existing error', () => {
            expect(
                reducer(
                    { error: 'Old error' },
                    {
                        type: ErrorActionType.SET,
                        error: 'New error',
                    }
                )
            ).toStrictEqual({ error: 'New error' });
        });

        it('updates undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ErrorActionType.SET,
                    error: 'Test error',
                })
            ).toStrictEqual({ error: 'Test error' });
        });
    });

    describe('clear', () => {
        it('clears error from filled state', () => {
            expect(
                reducer(
                    { error: 'Test error' },
                    {
                        type: ErrorActionType.CLEAR,
                    }
                )
            ).toStrictEqual({ error: null });
        });

        it('clears error from empty state', () => {
            expect(
                reducer(
                    { error: null },
                    {
                        type: ErrorActionType.CLEAR,
                    }
                )
            ).toStrictEqual({ error: null });
        });

        it('clears error from undefined state', () => {
            expect(
                reducer(undefined, {
                    type: ErrorActionType.CLEAR,
                })
            ).toStrictEqual({ error: null });
        });
    });
});
