import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Profile } from './types';

const slice = createSlice({
    name: 'profile',
    initialState: {} as Profile,
    reducers: {
        setProfileAction: (_state, action: PayloadAction<Profile>) => action.payload,
        setAllowedAction: (state, action: PayloadAction<boolean>) => {
            state.allowed = action.payload;
        },
        resetProfileAction: () => ({}),
    },
});

export const { setProfileAction, setAllowedAction, resetProfileAction } = slice.actions;
export const profile = slice.reducer;
