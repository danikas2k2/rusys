import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Google } from './types';

const slice = createSlice({
    name: 'google',
    initialState: {} as Google,
    reducers: {
        setClientIdAction: (state, action: PayloadAction<string>) => {
            state.clientId = action.payload;
        },
        setLoadingAction: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setClientIdAction, setLoadingAction } = slice.actions;
export const google = slice.reducer;
