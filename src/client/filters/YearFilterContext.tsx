import { noop } from 'lodash';
import React, { createContext, use, useMemo } from 'react';

import { useSearchParamState } from '~/client/filters/hooks/useSearchParamState';

export const getCurrentYear = (): number => new Date().getFullYear();

export function getLastCalendarYears(count = 3): readonly number[] {
    const current = getCurrentYear();
    return Array.from({ length: Math.max(1, count) }, (_, i) => current - i);
}

export const YearFilterContext = createContext<[number, (v: number) => void]>([getCurrentYear(), noop]);

export function YearFilterWrapper({
    paramName = 'y',
    initialState,
    children,
}: React.PropsWithChildren<{ paramName?: string; initialState?: number }>) {
    const defaultYear = useMemo(() => initialState || getCurrentYear(), [initialState]);
    return <YearFilterContext value={useSearchParamState(paramName, defaultYear)}>{children}</YearFilterContext>;
}

export const useYearFilter = () => use(YearFilterContext);
