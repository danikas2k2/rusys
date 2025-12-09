import { clearErrorAction, ErrorActionType, setErrorAction } from '~/client/state/error/actions';

describe('error actions', () => {
    describe('setErrorAction', () => {
        it('creates SET action with error message', () => {
            const action = setErrorAction('Test error');

            expect(action).toStrictEqual({
                type: ErrorActionType.SET,
                error: 'Test error',
            });
        });
    });

    describe('clearErrorAction', () => {
        it('creates CLEAR action', () => {
            const action = clearErrorAction();

            expect(action).toStrictEqual({
                type: ErrorActionType.CLEAR,
            });
        });
    });
});
