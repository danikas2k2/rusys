import { ApiUrl, type ApiUserEmail } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setAllowedAction } from '~/state/profile/actions';

export function useEmailCheck(): (email: string) => Promise<void> {
    const request = useUpdatingApiRequest<ApiUserEmail>({ allowed: setAllowedAction });
    return async (email: string): Promise<void> => {
        if (email) {
            await request(ApiUrl.CheckUser, { email });
        }
    };
}
