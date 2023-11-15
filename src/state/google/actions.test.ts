import { GoogleActionType, setClientIdAction, setLoadingAction } from '~/state/google/actions';

describe('setLoadingAction', () => {
    it('returns valid action', () => {
        expect(setLoadingAction(true)).toEqual({
            type: GoogleActionType.SET_LOADING,
            loading: true,
        });
    });
});

describe('setClientIdAction', () => {
    it('returns valid action', () => {
        expect(setClientIdAction('123')).toEqual({
            type: GoogleActionType.SET_CLIENT_ID,
            clientId: '123',
        });
    });
});
