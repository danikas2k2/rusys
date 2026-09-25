import { GoogleActionType, setClientIdAction, setLoadingAction } from '~/store/google/actions';

describe('setLoadingAction', () => {
    it('returns valid action', () => {
        expect(setLoadingAction(true)).toStrictEqual({
            type: GoogleActionType.SET_LOADING,
            loading: true,
        });
    });
});

describe('setClientIdAction', () => {
    it('returns valid action', () => {
        expect(setClientIdAction('123')).toStrictEqual({
            type: GoogleActionType.SET_CLIENT_ID,
            clientId: '123',
        });
    });
});
