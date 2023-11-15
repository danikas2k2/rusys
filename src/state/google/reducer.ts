import { type GoogleAction, GoogleActionType } from '~/state/google/actions';
import { type Google } from '~/state/google/types';

export default function google(state: Google = {}, action: GoogleAction): Google {
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
