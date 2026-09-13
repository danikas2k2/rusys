import type { Product, Summary } from '@rusys/common/data';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { ActionCreatorsMapObject } from 'redux';

import { setGroupsAction } from '~/client/state/groups/actions';
import { setUndatesAction, setUpdatesAction } from '~/client/state/history/actions';
import { setProductsAction } from '~/client/state/products/actions';
import { setSummaryAction } from '~/client/state/summary/actions';
import { setVariantsAction } from '~/client/state/variants/actions';
import { setYearsAction } from '~/client/state/years/actions';

export interface RefreshResult {
    years?: number[];
    products?: Product[];
    summary?: Summary[];
    ok?: boolean;
    error?: string;
}

const UPDATE_ACTIONS: ActionCreatorsMapObject = {
    years: setYearsAction,
    groups: setGroupsAction,
    variants: setVariantsAction,
    products: setProductsAction,
    summary: setSummaryAction,
    updates: setUpdatesAction,
    undates: setUndatesAction,
};

export function useUpdateStateFromResponse(updateActions = UPDATE_ACTIONS): (result?: RefreshResult) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(
        async (result?: RefreshResult): Promise<void> => {
            if (!result) {
                return;
            }
            if ('ok' in result && !result.ok) {
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
