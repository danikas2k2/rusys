import { useMemo } from 'react';

import { UpdateTypes, useUpdateType } from '~/client/common/UpdateTypeContext';
import { useSummary } from '~/state/summary/useSummary';
import { type Summary } from '~/types/data';

export function useRecycledSummary(): ReadonlyArray<Summary> {
    const [updateType] = useUpdateType();
    const recycled = updateType === UpdateTypes.Recycled;
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
        [summary, recycled]
    );
}
