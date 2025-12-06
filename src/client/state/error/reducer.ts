import { ErrorActionType, type ErrorAction } from '~/client/state/error/actions';

export interface ErrorState {
    error: string | null;
}

export function error(state: Readonly<ErrorState> = { error: null }, action: Readonly<ErrorAction>): Readonly<ErrorState> {
    switch (action.type) {
        case ErrorActionType.SET:
            return { error: action.error };
        case ErrorActionType.CLEAR:
            return { error: null };
        default:
            return state;
    }
}

