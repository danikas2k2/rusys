import { ApiUrl, type ApiSetMissing } from '@rusys/common/api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/client/state/products/actions';
import { getErrorMessage } from '~/client/utils/errors';

export function useSetProductMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSetMissing>();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            if (!group || !name) {
                return;
            }

            dispatch(setProductsMissingAction(group, name, missing));

            try {
                await request(ApiUrl.ProductsSetMissing, { group, name, missing });
            } catch (error) {
                dispatch(rollbackProductsMissingAction(group, name));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [request, dispatch]
    );
}
