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
