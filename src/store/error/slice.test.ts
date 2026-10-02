import { clearErrorAction, error as reducer, setErrorAction } from '~/store/error/slice';

describe('error actions', () => {
    describe('setErrorAction', () => {
        it('creates SET action with error message', () => {
            const action = setErrorAction('Test error');

            expect(action).toStrictEqual({ type: setErrorAction.type, payload: 'Test error' });
        });
    });

    describe('clearErrorAction', () => {
        it('creates CLEAR action', () => {
            const action = clearErrorAction();

            expect(action).toStrictEqual({ type: clearErrorAction.type, payload: undefined });
        });
    });
});

describe('error', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' };

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
            expect(reducer({ error: null }, setErrorAction('Test error'))).toStrictEqual({ error: 'Test error' });
        });

        it('updates existing error', () => {
            expect(reducer({ error: 'Old error' }, setErrorAction('New error'))).toStrictEqual({ error: 'New error' });
        });

        it('updates undefined state', () => {
            expect(reducer(undefined, setErrorAction('Test error'))).toStrictEqual({ error: 'Test error' });
        });
    });

    describe('clear', () => {
        it('clears error from filled state', () => {
            expect(reducer({ error: 'Test error' }, clearErrorAction())).toStrictEqual({ error: null });
        });

        it('clears error from empty state', () => {
            expect(reducer({ error: null }, clearErrorAction())).toStrictEqual({ error: null });
        });

        it('clears error from undefined state', () => {
            expect(reducer(undefined, clearErrorAction())).toStrictEqual({ error: null });
        });
    });
});
