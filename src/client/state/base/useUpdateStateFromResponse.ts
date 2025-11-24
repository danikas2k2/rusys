import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import type { ActionCreatorsMapObject } from 'redux';

import { setGroupsAction } from '~/client/state/groups/actions';
import { setProductsAction } from '~/client/state/products/actions';
import { setSummaryAction } from '~/client/state/summary/actions';
import { setVariantsAction } from '~/client/state/variants/actions';
import { setYearsAction } from '~/client/state/years/actions';
import type { ApiResult } from '~/types/api';
import type { Product, Summary } from '~/types/data';

export type RefreshResult = ApiResult<{
    years?: number[];
    products?: Product[];
    summary?: Summary[];
}>;

const UPDATE_ACTIONS: ActionCreatorsMapObject = {
    years: setYearsAction,
    groups: setGroupsAction,
    variants: setVariantsAction,
    products: setProductsAction,
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
