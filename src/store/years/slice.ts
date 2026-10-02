import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const slice = createSlice({
    name: 'years',
    initialState: [] as readonly number[],
    reducers: {
        setYearsAction: (_state, action: PayloadAction<number[]>) => [...action.payload],
    },
});

export const { setYearsAction } = slice.actions;
export const years = slice.reducer;
