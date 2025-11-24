import { cloneDeep } from 'lodash';

import { ProductsActionType, type ProductsAction } from '~/client/state/products/actions';
import type { Product } from '~/types/data';

export function products(state: readonly Product[] = [], action: Readonly<ProductsAction>): readonly Product[] {
    switch (action.type) {
        case ProductsActionType.SET:
            return cloneDeep(action.products);

        case ProductsActionType.SET_MISSING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name ? d : { ...d, missing: action.missing || undefined }
            );

        case ProductsActionType.SET_REMOVING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) =>
                              y.year !== action.year ? y : { ...y, removing: action.removing || undefined }
                          ),
                      }
            );

        default:
            return state;
    }
}
