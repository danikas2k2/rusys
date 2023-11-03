import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type Action } from 'redux';
import { setDetailsAction } from '~/store/details/actions';
import { type AmountSet } from '~/store/details/types';
import { setMissingAction } from '~/store/missing/actions';
import { setRemovingAction } from '~/store/removing/actions';
import { type RemovingSet } from '~/store/removing/types';
import { setSummaryAction } from '~/store/summary/actions';
import { type CommonResponse, type Name, type Year } from '~/store/types';
import { setYearsAction } from '~/store/years/actions';

export interface RefreshResponse extends CommonResponse {
    years?: Year[];
    details?: AmountSet;
    removing?: RemovingSet;
    missing?: Name[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshActions: Record<string, (value: any) => Action> = {
    years: setYearsAction,
    details: setDetailsAction,
    statistics: setSummaryAction,
    removing: setRemovingAction,
    missing: setMissingAction,
};

export default function useSetStateFromResponse(): (response: Response | Promise<Response>) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(
        async (response: Response | Promise<Response>): Promise<void> => {
            const refresh: RefreshResponse = await (await response).json();
            if (refresh?.ok) {
                for (const update of Object.keys(refresh)) {
                    const action = refreshActions[update];
                    if (action) {
                        dispatch(action(refresh[update as keyof RefreshResponse]));
                    }
                }
                return;
            }
            throw refresh?.error;
        },
        [dispatch]
    );
}
