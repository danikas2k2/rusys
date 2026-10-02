import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import type { Product, ProductHistory, RemovingYearAmounts } from '~/common/data';

export interface RemovingYearAmountsWithRollback extends RemovingYearAmounts {
    prevRemoving?: boolean;
}

interface ProductWithRollback extends Product {
    prevMissing?: Product['missing'];
    years?: readonly RemovingYearAmountsWithRollback[];
}

type ProductKey = { group: string; name: string };
type ProductYearKey = ProductKey & { year: number };

const slice = createSlice({
    name: 'products',
    initialState: [] as readonly ProductWithRollback[],
    reducers: {
        setProductsAction: (state: readonly ProductWithRollback[], action: PayloadAction<readonly Product[]>) =>
            action.payload.map((product) => {
                const current = state.find((item) => item.group === product.group && item.name === product.name);
                return { ...cloneDeep(product), ...(current?.history ? { history: current.history } : {}) };
            }),
        setProductHistoryAction: (
            state: readonly ProductWithRollback[],
            action: PayloadAction<ProductYearKey & { history: ProductHistory }>
        ) =>
            state.map((product) =>
                product.group !== action.payload.group || product.name !== action.payload.name
                    ? product
                    : {
                          ...product,
                          history: { ...product.history, [action.payload.year]: cloneDeep(action.payload.history) },
                      }
            ),
        setProductsMissingAction: (
            state: readonly ProductWithRollback[],
            action: PayloadAction<ProductKey & { missing: boolean }>
        ) =>
            state.map((product) =>
                product.group !== action.payload.group || product.name !== action.payload.name
                    ? product
                    : {
                          ...product,
                          missing: action.payload.missing || undefined,
                          prevMissing: product.missing,
                      }
            ),
        rollbackProductsMissingAction: (state: readonly ProductWithRollback[], action: PayloadAction<ProductKey>) =>
            state.map((product) =>
                product.group !== action.payload.group || product.name !== action.payload.name
                    ? product
                    : {
                          ...product,
                          missing: product.prevMissing !== undefined ? product.prevMissing : undefined,
                          prevMissing: undefined,
                      }
            ),
        setProductsRemovingAction: (
            state: readonly ProductWithRollback[],
            action: PayloadAction<ProductYearKey & { removing: boolean }>
        ) =>
            state.map((product) =>
                product.group !== action.payload.group || product.name !== action.payload.name
                    ? product
                    : {
                          ...product,
                          years: product.years?.map((year) =>
                              year.year !== action.payload.year
                                  ? year
                                  : {
                                        ...year,
                                        removing: action.payload.removing || undefined,
                                        prevRemoving: year.removing,
                                    }
                          ),
                      }
            ),
        rollbackProductsRemovingAction: (
            state: readonly ProductWithRollback[],
            action: PayloadAction<ProductYearKey>
        ) =>
            state.map((product) =>
                product.group !== action.payload.group || product.name !== action.payload.name
                    ? product
                    : {
                          ...product,
                          years: product.years?.map((year) =>
                              year.year !== action.payload.year
                                  ? year
                                  : {
                                        ...year,
                                        removing: year.prevRemoving !== undefined ? year.prevRemoving : undefined,
                                        prevRemoving: undefined,
                                    }
                          ),
                      }
            ),
    },
});

export const {
    setProductsAction,
    setProductHistoryAction,
    setProductsMissingAction,
    rollbackProductsMissingAction,
    setProductsRemovingAction,
    rollbackProductsRemovingAction,
} = slice.actions;
export const products = slice.reducer;
