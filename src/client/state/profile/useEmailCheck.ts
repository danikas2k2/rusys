import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setAllowedAction } from '~/client/state/profile/actions';
import { ApiUrl, type ApiUserEmail } from '~/common/api';

export function useEmailCheck(): (email: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUserEmail>({ allowed: setAllowedAction });
    return async (email: string): Promise<void> => {
        if (email) {
            await request(ApiUrl.CheckUser, { email });
        }
    };
}
