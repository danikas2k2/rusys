import type { Product, ProductHistory } from '~/common/data';

export const enum ProductsActionType {
    SET = 'products.set',
    SET_HISTORY = 'products.set.history',
    SET_MISSING = 'products.set.missing',
    ROLLBACK_MISSING = 'products.rollback.missing',
    SET_REMOVING = 'products.set.removing',
    ROLLBACK_REMOVING = 'products.rollback.removing',
}

export type ProductsAction =
    | {
          type: ProductsActionType.SET;
          products: readonly Product[];
      }
    | {
          type: ProductsActionType.SET_HISTORY;
          group: string;
          name: string;
          year: number;
          history: ProductHistory;
      }
    | {
          type: ProductsActionType.SET_MISSING;
          group: string;
          name: string;
          missing: boolean;
      }
    | {
          type: ProductsActionType.ROLLBACK_MISSING;
          group: string;
          name: string;
      }
    | {
          type: ProductsActionType.SET_REMOVING;
          group: string;
          name: string;
          year: number;
          removing: boolean;
      }
    | {
          type: ProductsActionType.ROLLBACK_REMOVING;
          group: string;
          name: string;
          year: number;
      };

export const setProductsAction = (products: readonly Product[]): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET,
    products,
});

export const setProductHistoryAction = (
    group: string,
    name: string,
    year: number,
    history: ProductHistory
): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET_HISTORY,
    group,
    name,
    year,
    history,
});

export const setProductsMissingAction = (group: string, name: string, missing: boolean): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET_MISSING,
    group,
    name,
    missing,
});

export const rollbackProductsMissingAction = (group: string, name: string): Readonly<ProductsAction> => ({
    type: ProductsActionType.ROLLBACK_MISSING,
    group,
    name,
});

export const setProductsRemovingAction = (
    group: string,
    name: string,
    year: number,
    removing: boolean
): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET_REMOVING,
    group,
    name,
    year,
    removing,
});

export const rollbackProductsRemovingAction = (
    group: string,
    name: string,
    year: number
): Readonly<ProductsAction> => ({
    type: ProductsActionType.ROLLBACK_REMOVING,
    group,
    name,
    year,
});
