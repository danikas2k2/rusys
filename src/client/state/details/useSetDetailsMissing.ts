import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setDetailsMissingAction } from '~/client/state/details/actions';
import { ApiUrl, type ApiSetMissing } from '~/types/api';

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
