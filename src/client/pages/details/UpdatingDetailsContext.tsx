import React, { createContext, use, useCallback, useState } from 'react';

import type { DetailsAmounts } from '~/types/data';

type UpdatingDetailsState = Record<string, boolean>;

type UpdatingDetails = Pick<DetailsAmounts, 'group' | 'name' | 'year'>;

export function getKey({ group, name, year }: UpdatingDetails): string {
    return `${group}:${name}:${year}`;
}

type SetUpdating = (data: UpdatingDetails, updating: boolean) => void;

export const UpdatingDetailsContext = createContext<[UpdatingDetailsState, SetUpdating]>([{}, () => {}]);

export function UpdatingDetailsWrapper({ children }: React.PropsWithChildren): React.ReactElement {
    const [state, setState] = useState<UpdatingDetailsState>({});

    const setUpdating = useCallback<SetUpdating>((details, updating) => {
        const key = getKey(details);
        setState((prev) => {
            if (updating) {
                return { ...prev, [key]: true };
            }
            const { [key]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    return <UpdatingDetailsContext value={[state, setUpdating]}>{children}</UpdatingDetailsContext>;
}

export function useUpdatingDetails(): [UpdatingDetailsState, SetUpdating] {
    return use(UpdatingDetailsContext);
}

export function useDetailsUpdating(details: UpdatingDetails): boolean {
    const [state] = useUpdatingDetails();
    const key = getKey(details);
    return state[key] ?? false;
}
