import { cloneDeep } from 'lodash';

import type { Product, RemovingYearAmounts } from '~/common/data';
import { ProductsActionType, type ProductsAction } from '~/store/products/actions';

export interface RemovingYearAmountsWithRollback extends RemovingYearAmounts {
    prevRemoving?: boolean;
}

interface ProductWithRollback extends Product {
    prevMissing?: Product['missing'];
    years?: readonly RemovingYearAmountsWithRollback[];
}

export function products(
    state: readonly ProductWithRollback[] = [],
    action: Readonly<ProductsAction>
): readonly Product[] {
    switch (action.type) {
        case ProductsActionType.SET:
            return action.products.map((product) => {
                const current = state.find((item) => item.group === product.group && item.name === product.name);
                return { ...cloneDeep(product), ...(current?.history ? { history: current.history } : {}) };
            });

        case ProductsActionType.SET_HISTORY:
            return state.map((product) =>
                product.group !== action.group || product.name !== action.name
                    ? product
                    : {
                          ...product,
                          history: { ...product.history, [action.year]: cloneDeep(action.history) },
                      }
            );

        case ProductsActionType.SET_MISSING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          missing: action.missing || undefined,
                          prevMissing: d.missing,
                      }
            );

        case ProductsActionType.ROLLBACK_MISSING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          missing: d.prevMissing !== undefined ? d.prevMissing : undefined,
                          prevMissing: undefined,
                      }
            );

        case ProductsActionType.SET_REMOVING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) =>
                              y.year !== action.year
                                  ? y
                                  : {
                                        ...y,
                                        removing: action.removing || undefined,
                                        prevRemoving: y.removing,
                                    }
                          ),
                      }
            );

        case ProductsActionType.ROLLBACK_REMOVING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) =>
                              y.year !== action.year
                                  ? y
                                  : {
                                        ...y,
                                        removing: y.prevRemoving !== undefined ? y.prevRemoving : undefined,
                                        prevRemoving: undefined,
                                    }
                          ),
                      }
            );

        default:
            return state;
    }
}
