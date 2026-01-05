import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export const getCurrentYear = (): number => new Date().getFullYear();

export function getLastCalendarYears(count = 3): readonly number[] {
    const current = getCurrentYear();
    return Array.from({ length: Math.max(1, count) }, (_, i) => current - i);
}

export const YearFilterContext = createContext<[number, (v: number) => void]>([getCurrentYear(), noop]);

export function YearFilterWrapper({ initialState, children }: React.PropsWithChildren<{ initialState?: number }>) {
    const defaultYear = useMemo(
        () => (typeof initialState === 'number' ? initialState : getCurrentYear()),
        [initialState]
    );
    return <YearFilterContext value={useState(defaultYear)}>{children}</YearFilterContext>;
}

export const useYearFilter = () => use(YearFilterContext);
