import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { runProductMutation } from '~/lib/productMutationQueue';
import { getErrorMessage } from '~/lib/utils/errors';
import type { Product, SetProductMissing } from '~/schema';
import { setProductMissingAction } from '~/server/actions/products';
import { CATALOG_KEYS } from '~/store/catalog';
import { useError } from '~/store/error/useError';

export function useSetProductMissing(): (request: SetProductMissing) => Promise<void> {
    const client = useQueryClient();
    const setError = useError((state) => state.setError);
    const refresh = useGetProducts();
    return useCallback(
        async (request: SetProductMissing): Promise<void> => {
            const { group, name, missing } = request;
            if (!group || !name) {
                return;
            }

            await runProductMutation(client, ['missing', group, name], async () => {
                const previousMissing = client
                    .getQueryData<readonly Product[]>(CATALOG_KEYS.products)
                    ?.find((product) => product.group === group && product.name === name)?.missing;
                client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
                    products?.map((product) =>
                        product.group === group && product.name === name
                            ? { ...product, missing: missing || undefined }
                            : product
                    )
                );

                try {
                    await setProductMissingAction(request);
                } catch (error) {
                    client.setQueryData<readonly Product[]>(CATALOG_KEYS.products, (products) =>
                        products?.map((product) => {
                            if (product.group !== group || product.name !== name) {
                                return product;
                            }
                            const restored = { ...product };
                            if (previousMissing === undefined) {
                                delete restored.missing;
                            } else {
                                restored.missing = previousMissing;
                            }
                            return restored;
                        })
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
