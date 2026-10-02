import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import type { Group } from '~/common/data';

const slice = createSlice({
    name: 'groups',
    initialState: [] as readonly Group[],
    reducers: {
        setGroupsAction: (_state, action: PayloadAction<Group[]>) => cloneDeep(action.payload),
    },
});

export const { setGroupsAction } = slice.actions;
export const groups = slice.reducer;
