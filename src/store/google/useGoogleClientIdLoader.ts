import { API } from '@rusys/common/api/v1';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { setClientIdAction, setLoadingAction } from '~/store/google/actions';
import { useGoogle } from '~/store/google/useGoogle';

export function useGoogleClientIdLoader(): () => Promise<void> {
    const dispatch = useDispatch();
    const google = useGoogle();
    const request = useUpdatingApiRequest({ clientId: setClientIdAction });
    return async (): Promise<void> => {
        if (google.clientId == null && !google.loading) {
            dispatch(setLoadingAction(true));
            await request(API.authClientId(), 'GET');
            dispatch(setLoadingAction(false));
        }
    };
}
