import { useCallback } from 'react';
import { useApiRequest, type RequestMethod } from '~/common/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { type ActionCreatorsMapObject } from 'redux';

export function useUpdatingApiRequest<T = object | string>(
    updateActions?: ActionCreatorsMapObject
): (url: string, data?: T, method?: RequestMethod) => Promise<void> {
    const request = useApiRequest();
    const update = useUpdateStateFromResponse(updateActions);
    return useCallback(async (...args): Promise<void> => update(await request(...args)), [request, update]);
}
