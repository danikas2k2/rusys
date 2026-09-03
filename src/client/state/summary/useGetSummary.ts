import { ApiUrl } from '@rusys/common/api';
import { useCallback } from 'react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

export function useGetSummary(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return useCallback(() => request(ApiUrl.Summary), [request]);
}
