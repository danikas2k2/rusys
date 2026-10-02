import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import type { ProductHistory, Summary } from '~/common/data';

type HistoryPayload = { group: string; name: string; year: number; history: ProductHistory };

const slice = createSlice({
    name: 'summary',
    initialState: [] as readonly Summary[],
    reducers: {
        setSummaryAction: (state: readonly Summary[], action: PayloadAction<Summary[]>) =>
            action.payload.map((item) => {
                const current = state.find(
                    (currentItem) => currentItem.group === item.group && currentItem.name === item.name
                );
                return { ...cloneDeep(item), ...(current?.history ? { history: current.history } : {}) };
            }),
        setSummaryHistoryAction: (state: readonly Summary[], action: PayloadAction<HistoryPayload>) =>
            state.map((item) =>
                item.group !== action.payload.group || item.name !== action.payload.name
                    ? item
                    : {
                          ...item,
                          history: { ...item.history, [action.payload.year]: cloneDeep(action.payload.history) },
                      }
            ),
    },
});

export const { setSummaryAction, setSummaryHistoryAction } = slice.actions;
export const summary = slice.reducer;
