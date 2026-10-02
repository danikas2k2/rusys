import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ErrorState {
    error: string | null;
}

const slice = createSlice({
    name: 'error',
    initialState: { error: null } as ErrorState,
    reducers: {
        setErrorAction: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearErrorAction: (state) => {
            state.error = null;
        },
    },
});

export const { setErrorAction, clearErrorAction } = slice.actions;
export const error = slice.reducer;
