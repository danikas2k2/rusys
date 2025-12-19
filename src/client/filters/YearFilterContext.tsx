import { noop } from 'lodash';
import React, { createContext, use, useMemo, useState } from 'react';

export function getCurrentYearYYYY(): number {
    return new Date().getFullYear();
}

export function getLastCalendarYears(count = 3): readonly number[] {
    const current = getCurrentYearYYYY();
    return Array.from({ length: Math.max(1, count) }, (_, i) => current - i);
}

export const YearFilterContext = createContext<[number, (v: number) => void]>([getCurrentYearYYYY(), noop]);

export function YearFilterWrapper({
    initialState,
    children,
}: React.PropsWithChildren<{ initialState?: number }>) {
    // ensure stable default for first render
    const defaultYear = useMemo(
        () => (typeof initialState === 'number' ? initialState : getCurrentYearYYYY()),
        [initialState]
    );
    return <YearFilterContext value={useState(defaultYear)}>{children}</YearFilterContext>;
}

export function useYearFilter() {
    return use(YearFilterContext);
}


