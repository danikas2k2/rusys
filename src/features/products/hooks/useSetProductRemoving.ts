import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { runProductMutation } from '~/lib/productMutationQueue';
import { getErrorMessage } from '~/lib/utils/errors';
import type { Product, SetProductRemoving } from '~/schema';
import { setProductRemovingAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useError } from '~/store/error/useError';

export function useSetProductRemoving(): (request: SetProductRemoving) => Promise<void> {
    const client = useQueryClient();
    const setError = useError((state) => state.setError);
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductRemoving): Promise<void> => {
            const { group, name, year, removing } = request;
            if (!group || !name || !year) {
                return;
            }

            await runProductMutation(client, ['removing', group, name, year], async () => {
                const previousRemoving = client
                    .getQueryData<readonly Product[]>(CATALOG_KEYS.products)
                    ?.find((product) => product.group === group && product.name === name)
                    ?.years?.find((value) => value.year === year)?.removing;
                client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
                    products?.map((product) =>
                        product.group === group && product.name === name
                            ? {
                                  ...product,
                                  years: product.years?.map((value) =>
                                      value.year === year ? { ...value, removing: removing || undefined } : value
                                  ),
                              }
                            : product
                    )
                );

                try {
                    await setProductRemovingAction(request);
                } catch (error) {
                    client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
                        products?.map((product) =>
                            product.group === group && product.name === name
                                ? {
                                      ...product,
                                      years: product.years?.map((value) => {
                                          if (value.year !== year) {
                                              return value;
                                          }
                                          const restored = { ...value };
                                          if (previousRemoving === undefined) {
                                              delete restored.removing;
                                          } else {
                                              restored.removing = previousRemoving;
                                          }
                                          return restored;
                                      }),
                                  }
                                : product
                        )
                    );
                    setError(getErrorMessage(error));
                    return;
                }

                try {
                    await refresh();
                } catch (error) {
                    setError(getErrorMessage(error));
                }
            });
        },
        [refresh, client, setError]
    );
}
