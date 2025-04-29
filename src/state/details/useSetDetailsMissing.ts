import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ApiUrl, type ApiSetMissing } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setDetailsMissingAction } from '~/state/details/actions';

export function useSetDetailsMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSetMissing>();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            if (group && name) {
                await request(ApiUrl.DetailsSetMissing, { group, name, missing });
                dispatch(setDetailsMissingAction(group, name, missing));
            }
        },
        [request, dispatch]
    );
}
