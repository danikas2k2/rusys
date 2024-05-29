import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiUpdateDetailsYears, ApiUrl } from '~/common/api';
import { type YearAmounts } from '~/common/types';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setDetailsYearsAction } from '~/state/details/actions';

export function useSetDetailsYears(): (
    group: string,
    name: string,
    years?: YearAmounts[],
    withoutHistory?: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiUpdateDetailsYears>();
    return useCallback(
        async (group: string, name: string, years?: YearAmounts[], withoutHistory?: boolean): Promise<void> => {
            if (group && name) {
                dispatch(setDetailsYearsAction(group, name, years));
                return request(ApiUrl.DetailsSetYears, { group, name, years, withoutHistory });
            }
        },
        [request, dispatch]
    );
}
