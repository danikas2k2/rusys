import { ApiUrl, type ApiUserEmail } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setAllowedAction } from '~/client/state/profile/actions';

export function useEmailCheck(): (email: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUserEmail>({ allowed: setAllowedAction });
    return async (email: string): Promise<void> => {
        if (email) {
            await request(ApiUrl.CheckUser, { email });
        }
    };
}
