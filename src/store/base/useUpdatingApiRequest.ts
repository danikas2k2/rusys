import { useCallback } from 'react';
import type { ActionCreatorsMapObject } from 'redux';

import { useUpdateStateFromResponse } from '~/store/base/useUpdateStateFromResponse';
import { useApiRequest, type RequestMethod } from '~/store/common/useApiRequest';

export function useUpdatingApiRequest<T = object | string>(
    updateActions?: ActionCreatorsMapObject
): (url: string, data?: T, method?: RequestMethod) => Promise<void> {
    const request = useApiRequest();
    const update = useUpdateStateFromResponse(updateActions);
    return useCallback(async (...args): Promise<void> => update(await request(...args)), [request, update]);
}
