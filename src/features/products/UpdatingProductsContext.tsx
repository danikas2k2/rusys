import React, { createContext, use, useCallback, useState } from 'react';

import type { ProductAmounts } from '~/common/data';
import { getId } from '~/lib/utils/id';

type UpdatingProductsState = Record<string, boolean>;

type UpdatingProduct = Pick<ProductAmounts, 'group' | 'name' | 'year'>;

export const getKey = ({ group, name, year }: UpdatingProduct): string => getId(group, name, year);

type SetUpdating = (data: UpdatingProduct, updating: boolean) => void;

export const UpdatingProductsContext = createContext<[UpdatingProductsState, SetUpdating]>([{}, () => {}]);

export function UpdatingProductsWrapper({ children }: React.PropsWithChildren): React.ReactElement {
    const [state, setState] = useState<UpdatingProductsState>({});

    const setUpdating = useCallback<SetUpdating>((product, updating) => {
        const key = getKey(product);
        setState((prev) => {
            if (updating) {
                return { ...prev, [key]: true };
            }
            const { [key]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    return <UpdatingProductsContext value={[state, setUpdating]}>{children}</UpdatingProductsContext>;
}

export function useUpdatingProducts(): [UpdatingProductsState, SetUpdating] {
    return use(UpdatingProductsContext);
}

export function useProductUpdating(product: UpdatingProduct): boolean {
    const [state] = useUpdatingProducts();
    const key = getKey(product);
    return state[key] ?? false;
}
