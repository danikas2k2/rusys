import { API } from '@rusys/common/api/v1';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { setAllowedAction } from '~/store/profile/actions';

export function useEmailCheck(): (email: string) => Promise<void> {
    const request = useUpdatingApiRequest({ allowed: setAllowedAction });
    return async (email: string): Promise<void> => {
        if (email) {
            await request(API.access(email), 'GET');
        }
    };
}
