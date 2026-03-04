import React, { createContext, use, useCallback, useState } from 'react';

import { getId } from '~/client/utils/id';
import type { History } from '~/types/data';

type UpdatingHistoryState = Record<string, boolean>;

type UpdatingHistory = Pick<History, 'time' | 'group' | 'name' | 'year' | 'user'>;

export const getKey = ({ time, group, name, year, user }: UpdatingHistory): string =>
    getId(time, group, name, year ?? '', user ?? '');

type SetUpdating = (data: UpdatingHistory, updating: boolean) => void;

export const UpdatingHistoryContext = createContext<[UpdatingHistoryState, SetUpdating]>([{}, () => {}]);

export function UpdatingHistoryWrapper({ children }: React.PropsWithChildren): React.ReactElement {
    const [state, setState] = useState<UpdatingHistoryState>({});

    const setUpdating = useCallback<SetUpdating>((history, updating) => {
        const key = getKey(history);
        setState((prev) => {
            if (updating) {
                return { ...prev, [key]: true };
            }
            const { [key]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    return <UpdatingHistoryContext value={[state, setUpdating]}>{children}</UpdatingHistoryContext>;
}

export function useUpdatingHistory(): [UpdatingHistoryState, SetUpdating] {
    return use(UpdatingHistoryContext);
}

export function useHistoryUpdating(history: UpdatingHistory): boolean {
    const [state] = useUpdatingHistory();
    const key = getKey(history);
    return state[key] ?? false;
}
