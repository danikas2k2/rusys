import { useCallback } from 'react';
import { type RequestMethod, useApiRequest } from '~/hooks/useApiRequest';
import { type UpdateActions, useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';

export function useUpdatingApiRequest(
    updateActions?: UpdateActions
): (url: string, data?: object | string, method?: RequestMethod) => Promise<void> {
    const request = useApiRequest();
    const update = useUpdateStateFromResponse(updateActions);
    return useCallback(async (...args): Promise<void> => update(await request(...args)), [request, update]);
}
