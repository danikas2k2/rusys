import { type GoogleAction, GoogleActionType } from '~/state/google/actions';
import { type Google } from '~/state/google/types';

export function google(state: Readonly<Google> = {}, action: Readonly<GoogleAction>): Readonly<Google> {
    switch (action.type) {
        case GoogleActionType.SET_CLIENT_ID:
            return {
                ...state,
                clientId: action.clientId,
            };

        case GoogleActionType.SET_LOADING:
            return {
                ...state,
                loading: action.loading,
            };

        default:
            return state;
    }
}
