import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setProductsMissingAction } from '~/client/state/products/actions';
import { ApiUrl, type ApiSetMissing } from '~/types/api';

export function useSetProductMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSetMissing>();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            if (group && name) {
                await request(ApiUrl.ProductsSetMissing, { group, name, missing });
                dispatch(setProductsMissingAction(group, name, missing));
            }
        },
        [request, dispatch]
    );
}
