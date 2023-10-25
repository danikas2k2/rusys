import { isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import { setClientIdAction, setLoadingAction } from '~/store/google/actions';

export default function useClientIdLoader(): () => Promise<void> {
    const dispatch = useDispatch();
    const google = useSelector((state: BaseState) => state.google, isEqual);
    return async (): Promise<void> => {
        if (google.clientId == null && !google.loading) {
            dispatch(setLoadingAction(true));
            const response = await fetch('/clientId');
            dispatch(setClientIdAction((await response.json()).clientId ?? ''));
            dispatch(setLoadingAction(false));
        }
    };
}
