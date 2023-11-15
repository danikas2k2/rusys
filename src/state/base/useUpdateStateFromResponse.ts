import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type Action } from 'redux';
import { setDetailsAction } from '~/state/details/actions';
import { type AmountSet } from '~/state/details/types';
import { setMissingAction } from '~/state/missing/actions';
import { type Missing } from '~/state/missing/types';
import { setRemovingAction } from '~/state/removing/actions';
import { type RemovingSet } from '~/state/removing/types';
import { setSummaryAction } from '~/state/summary/actions';
import { type CommonResponse, type Year } from '~/state/types';
import { setYearsAction } from '~/state/years/actions';

export interface RefreshResponse extends CommonResponse {
    years?: Year[];
    details?: AmountSet;
    summary?: AmountSet;
    removing?: RemovingSet;
    missing?: Missing;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UpdateAction = (value: any) => Action;
export type UpdateActions = Record<string, UpdateAction>;

const UPDATE_ACTIONS: UpdateActions = {
    years: setYearsAction,
    details: setDetailsAction,
    summary: setSummaryAction,
    removing: setRemovingAction,
    missing: setMissingAction,
};

export function useUpdateStateFromResponse(
    updateActions = UPDATE_ACTIONS
): (response?: RefreshResponse) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(
        async (response?: RefreshResponse): Promise<void> => {
            if (!response || !('ok' in response)) {
                return;
            }
            if (!response?.ok) {
                throw new Error(response?.error ?? 'Request failed');
            }
            for (const update of Object.keys(response)) {
                const action = updateActions[update];
                if (action) {
                    dispatch(action(response[update as keyof RefreshResponse]));
                }
            }
        },
        [dispatch, updateActions]
    );
}
