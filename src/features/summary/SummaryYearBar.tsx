import { Group, SegmentedControl, Stack } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { SummaryAmounts } from '~/features/summary/SummaryAmounts';
import { SummaryYear } from '~/features/summary/SummaryYear';
import type { ProductAmounts } from '~/schema';
import { useSummary } from '~/store/summary';

import '../common/YearTotal.css';

export function SummaryYearBar() {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const summary = useSummary();
    const activeData = active?.data;

    const item = useMemo(
        () => summary.find(({ group, name }) => group === activeData?.group && name === activeData?.name),
        [summary, activeData?.group, activeData?.name]
    );
    const years = useMemo(() => item?.years?.map(({ year }) => year).toSorted((a, b) => b - a) ?? [], [item]);

    const handleYearChange = useCallback(
        (value: string) => {
            if (!activeData) {
                return;
            }
            const year = Number(value);
            const amounts = item?.years?.find((entry) => entry.year === year)?.amounts ?? [];
            setActive({ action: 'history', data: { ...activeData, year, amounts } });
        },
        [activeData, item, setActive]
    );

    if (!activeData) {
        return null;
    }

    return (
        <Stack gap="xs" data-summary-year-bar>
            {years.length > 0 && (
                <SegmentedControl
                    fullWidth
                    size="sm"
                    data={years.map((year) => ({
                        value: String(year),
                        label: <SummaryYear year={year} />,
                    }))}
                    value={String(activeData.year)}
                    onChange={handleYearChange}
                />
            )}
            <Group justify="center" data-year-total data-dialog-year-total>
                <SummaryAmounts group={activeData.group} amounts={activeData.amounts} inline />
            </Group>
        </Stack>
    );
}
