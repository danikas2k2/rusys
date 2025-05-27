import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setDetailsAction } from '~/state/details/actions';
import { setGroupsAction } from '~/state/groups/actions';
import { setSummaryAction } from '~/state/summary/actions';
import { setVariantsAction } from '~/state/variants/actions';
import { setYearsAction } from '~/state/years/actions';
import { type ApiResult } from '~/types/api';
import { type Details, type Summary } from '~/types/data';
import { type ActionCreatorsMapObject } from 'redux';

export type RefreshResult = ApiResult<{
    years?: number[];
    details?: Details[];
    summary?: Summary[];
}>;

const UPDATE_ACTIONS: ActionCreatorsMapObject = {
    years: setYearsAction,
    groups: setGroupsAction,
    variants: setVariantsAction,
    details: setDetailsAction,
    summary: setSummaryAction,
};

export function useUpdateStateFromResponse(updateActions = UPDATE_ACTIONS): (result?: RefreshResult) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(
        async (result?: RefreshResult): Promise<void> => {
            if (!result || !('ok' in result)) {
                return;
            }
            if (!result.ok) {
                throw new Error(result.error || 'Request failed');
            }
            for (const update of Object.keys(result)) {
                const action = updateActions[update];
                if (action) {
                    dispatch(action(result[update as keyof RefreshResult]));
                }
            }
        },
        [dispatch, updateActions]
    );
}
