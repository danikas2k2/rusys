import { api } from '@config';
import type { ThunkAction } from 'redux-thunk';
import type { BaseState } from '~/store/base.types';

export const enum GoogleActionType {
    SET_CLIENT_ID = 'google.clientId',
    SET_LOADING = 'google.loading',
}

export type GoogleAction =
    | {
          type: GoogleActionType.SET_CLIENT_ID;
          clientId: string;
      }
    | {
          type: GoogleActionType.SET_LOADING;
          loading: boolean;
      };

export const setClientIdAction = (clientId: string): GoogleAction => ({
    type: GoogleActionType.SET_CLIENT_ID,
    clientId,
});

export const setLoadingAction = (loading: boolean): GoogleAction => ({ type: GoogleActionType.SET_LOADING, loading });

export const loadClientIdAction = (): ThunkAction<void, BaseState, void, GoogleAction> => {
    return async (dispatch, getState) => {
        const google = getState().google;
        if (!google.clientId && !google.loading) {
            dispatch(setLoadingAction(true));
            const response = await fetch(`${api}/clientId`);
            dispatch(setClientIdAction((await response.json()).clientId));
            dispatch(setLoadingAction(false));
        }
    };
};
