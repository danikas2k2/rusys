import { Select } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';
import React, { useCallback, useMemo } from 'react';

import { getCurrentYearYYYY, getLastCalendarYears, useYearFilter } from '~/client/filters/YearFilterContext';
import { useLabel } from '~/client/hooks/useLabel';
import { ClearFilterIcon } from '~/client/toolbar/ClearFilterIcon';

export function ToolbarYearFilter() {
    const [year, setYear] = useYearFilter();

    const yearOptions = useMemo(
        () => getLastCalendarYears(3).map((y) => ({ value: `${y}`, label: `${y}` })),
        []
    );

    const defaultYear = getCurrentYearYYYY();
    const showClear = year !== defaultYear;

    const handleClear = useCallback(() => setYear(defaultYear), [defaultYear, setYear]);

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
            rightSectionWidth={showClear ? 60 : 40}
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
                    {showClear && <ClearFilterIcon onClick={handleClear} />}
                    <IconSelector size={16} style={{ pointerEvents: 'none' }} />
                </div>
            }
        />
    );
}


