import { Select } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';
import React, { useMemo } from 'react';

import { getLastCalendarYears, useYearFilter } from '~/client/filters/YearFilterContext';
import { useLabel } from '~/client/hooks/useLabel';

export function ToolbarYearFilter() {
    const [year, setYear] = useYearFilter();

    const yearOptions = useMemo(() => getLastCalendarYears(3).map((y) => ({ value: `${y}`, label: `${y}` })), []);

    return (
        <Select
            placeholder={useLabel('Year')}
            value={`${year}`}
            onChange={(value) => {
                const parsed = Number(value);
                if (!Number.isNaN(parsed)) {
                    setYear(parsed);
                }
            }}
            data={yearOptions}
            style={{ width: '100%' }}
            allowDeselect={false}
            withAlignedLabels
            checkIconPosition="left"
            rightSectionWidth={40}
            styles={{
                input: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                },
            }}
            rightSection={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                    }}
                >
                    <IconSelector size={16} style={{ pointerEvents: 'none' }} />
                </div>
            }
        />
    );
}
