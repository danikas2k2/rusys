import { noop } from 'lodash';
import React, { createContext, use, useState } from 'react';

export const getCurrentYear = (): number => new Date().getFullYear();

export function getLastCalendarYears(count = 3): readonly number[] {
    const current = getCurrentYear();
    return Array.from({ length: Math.max(1, count) }, (_, i) => current - i);
}

export const YearFilterContext = createContext<[number, (v: number) => void]>([getCurrentYear(), noop]);

export function YearFilterWrapper({ initialState, children }: React.PropsWithChildren<{ initialState?: number }>) {
    return <YearFilterContext value={useState(initialState || getCurrentYear())}>{children}</YearFilterContext>;
}

export const useYearFilter = () => use(YearFilterContext);
