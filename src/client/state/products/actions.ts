import type { Product } from '~/types/data';

export const enum ProductsActionType {
    SET = 'products.set',
    SET_MISSING = 'products.set.missing',
    SET_REMOVING = 'products.set.removing',
}

export type ProductsAction =
    | {
          type: ProductsActionType.SET;
          products: readonly Product[];
      }
    | {
          type: ProductsActionType.SET_MISSING;
          group: string;
          name: string;
          missing: boolean;
      }
    | {
          type: ProductsActionType.SET_REMOVING;
          group: string;
          name: string;
          year: number;
          removing: boolean;
      };

export const setProductsAction = (products: readonly Product[]): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET,
    products,
});

export const setProductsMissingAction = (group: string, name: string, missing: boolean): Readonly<ProductsAction> => ({
    type: ProductsActionType.SET_MISSING,
    group,
    name,
    missing,
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
