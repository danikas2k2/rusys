import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import type { Variant } from '~/common/data';

const slice = createSlice({
    name: 'variants',
    initialState: [] as readonly Variant[],
    reducers: {
        setVariantsAction: (_state, action: PayloadAction<Variant[]>) => cloneDeep(action.payload),
    },
});

export const { setVariantsAction } = slice.actions;
export const variants = slice.reducer;
