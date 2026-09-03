import { ApiUrl } from '@rusys/common/api';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setClientIdAction, setLoadingAction } from '~/client/state/google/actions';
import { useGoogle } from '~/client/state/google/useGoogle';

export function useGoogleClientIdLoader(): () => Promise<void> {
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
