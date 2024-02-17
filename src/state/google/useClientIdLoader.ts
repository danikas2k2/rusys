import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setClientIdAction, setLoadingAction } from '~/state/google/actions';
import { useGoogle } from '~/state/google/useGoogle';

export function useClientIdLoader(): () => Promise<void> {
    const dispatch = useDispatch();
    const google = useGoogle();
    const request = useUpdatingApiRequest({ clientId: setClientIdAction });
    return async (): Promise<void> => {
        if (google.clientId == null && !google.loading) {
            dispatch(setLoadingAction(true));
            await request(ApiUrl.ClientId);
            dispatch(setLoadingAction(false));
        }
    };
}
