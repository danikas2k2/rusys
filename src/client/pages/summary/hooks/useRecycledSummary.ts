import { useMemo } from 'react';

import { useUpdateType } from '~/client/common/UpdateTypeContext';
import { useSummary } from '~/client/state/summary/useSummary';
import type { Summary } from '~/types/data';

export function useRecycledSummary(): readonly Summary[] {
    const [updateType] = useUpdateType();
    const recycled = updateType === 'recycled';
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
