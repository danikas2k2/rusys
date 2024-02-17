import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiUpdateDetailsAmounts, ApiUrl } from '~/common/api';
import { type VariantAmount } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setDetailsAmountsAction } from '~/state/details/actions';

export function useSetDetailsAmounts(): (
    group: string,
    name: string,
    year: number,
    amounts?: ReadonlyArray<VariantAmount>,
    withoutHistory?: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiUpdateDetailsAmounts>();
    return useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: ReadonlyArray<VariantAmount>,
            withoutHistory?: boolean
        ): Promise<void> => {
            dispatch(setDetailsAmountsAction(group, name, year, amounts));
            return request(ApiUrl.DetailsSetAmounts, { group, name, year, amounts, withoutHistory });
        },
        [request, dispatch]
    );
}
