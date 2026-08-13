import { Group, SegmentedControl, Stack } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { SummaryAmounts, type SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import { SummaryYear } from '~/client/pages/summary/SummaryYear';
import { useSummary } from '~/client/state/summary/useSummary';

export function SummaryYearBar() {
    const [active, setActive] = useActiveContent<SummaryHistoryData>();
    const summary = useSummary();
    const activeData = active?.data;

    const item = useMemo(
        () => summary.find(({ group, name }) => group === activeData?.group && name === activeData?.name),
        [summary, activeData?.group, activeData?.name]
    );
    const years = useMemo(() => item?.years?.map(({ year }) => year).sort((a, b) => b - a) ?? [], [item]);

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
            <Group justify="center" data-year-total>
                <SummaryAmounts group={activeData.group} amounts={activeData.amounts} inline />
            </Group>
        </Stack>
    );
}
