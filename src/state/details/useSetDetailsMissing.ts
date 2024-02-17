import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiSetMissing, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setDetailsMissingAction } from '~/state/details/actions';

export function useSetDetailsMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSetMissing>();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            dispatch(setDetailsMissingAction(group, name, missing));
            return request(ApiUrl.DetailsSetMissing, { group, name, missing });
        },
        [request, dispatch]
    );
}
