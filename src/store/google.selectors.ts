import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { BaseState } from '~/store/base.types';
import { loadClientIdAction } from '~/store/google.actions';

export const useClientId = (): string | undefined => {
    const google = useSelector((state: BaseState) => state.google);
    const dispatch = useDispatch();
    useEffect(() => {
        if (!google.clientId) {
            dispatch(loadClientIdAction());
        }
    }, [dispatch, google.clientId]);
    return google?.clientId;
};
