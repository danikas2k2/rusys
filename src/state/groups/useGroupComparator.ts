import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { compareNames } from '~/client/utils/compareNames';
import { type WithGroupsState } from './types';
import { isEqual } from 'lodash';

export function useGroupComparator(): (a: string, b: string) => number {
    const groupOrders = useSelector(
        (state: WithGroupsState) =>
            state.groups?.reduce<Record<string, number>>((r, { group, order }) => ({ ...r, [group]: order }), {}) ?? {},
        isEqual
    );
    return useCallback(
        (a: string, b: string): number =>
            (groupOrders[a] ?? Number.POSITIVE_INFINITY) - (groupOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [groupOrders]
    );
}
