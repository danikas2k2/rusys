import { useMemo } from 'react';
import { useRecycled } from '~/client/common/RecycledContext';
import { useSummary } from '~/state/summary/useSummary';
import { type Summary } from '~/types/data';

export function useRecycledSummary(): ReadonlyArray<Summary> {
    const [recycled] = useRecycled();
    const summary = useSummary();
    return useMemo(
        () =>
            summary
                .map((v) => ({
                    ...v,
                    years: v.years
                        ?.map((y) => ({
                            ...y,
                            amounts: y.amounts.filter((a) => !!a.recycled === recycled),
                        }))
                        .filter((y) => y.amounts.length),
                }))
                .filter((v) => v.years?.length),
        [recycled, summary]
    );
}
