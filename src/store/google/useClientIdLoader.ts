import { api } from '@config';
import { useDispatch, useSelector } from 'react-redux';
import type { BaseState } from '~/store/base/types';
import { setClientIdAction, setLoadingAction } from '~/store/google/actions';

export default function useClientIdLoader(): () => Promise<void> {
    const dispatch = useDispatch();
    const google = useSelector((state: BaseState) => state.google);
    return async (): Promise<void> => {
        if (!google.clientId && !google.loading) {
            dispatch(setLoadingAction(true));
            const response = await fetch(`${api}/clientId`);
            dispatch(setClientIdAction((await response.json()).clientId));
            dispatch(setLoadingAction(false));
        }
    };
}
