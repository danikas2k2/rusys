import { createSelector } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { WithGroupsState } from '~/client/state/groups/types';
import { compareNames } from '~/client/utils/compareNames';
import type { Group } from '~/types/data';

const selectGroupOrders = createSelector(
    (state: WithGroupsState) => state.groups,
    (groups: readonly Group[] | undefined): Record<string, number> => {
        const orders: Record<string, number> = {};
        for (const { group, order } of groups ?? []) {
            orders[group] = order;
        }
        return orders;
    }
);

export function useGroupComparator(): (a: string, b: string) => number {
    const groupOrders = useSelector<WithGroupsState, Record<string, number>>(selectGroupOrders);
    return useCallback(
        (a: string, b: string): number =>
            (groupOrders[a] ?? Number.POSITIVE_INFINITY) - (groupOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [groupOrders]
    );
}
