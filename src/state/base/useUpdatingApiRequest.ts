import { useCallback } from 'react';
import { type ActionCreatorsMapObject } from 'redux';
import { type RequestMethod, useApiRequest } from '~/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';

export function useUpdatingApiRequest<T = object | string>(
    updateActions?: ActionCreatorsMapObject
): (url: string, data?: T, method?: RequestMethod) => Promise<void> {
    const request = useApiRequest();
    const update = useUpdateStateFromResponse(updateActions);
    return useCallback(async (...args): Promise<void> => update(await request(...args)), [request, update]);
}
