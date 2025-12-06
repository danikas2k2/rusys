export const enum ErrorActionType {
    SET = 'error.set',
    CLEAR = 'error.clear',
}

export type ErrorAction =
    | {
          type: ErrorActionType.SET;
          error: string;
      }
    | {
          type: ErrorActionType.CLEAR;
      };

export const setErrorAction = (error: string): Readonly<ErrorAction> => ({
    type: ErrorActionType.SET,
    error,
});

export const clearErrorAction = (): Readonly<ErrorAction> => ({
    type: ErrorActionType.CLEAR,
});

