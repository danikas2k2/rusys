import React from 'react';

import { useLabels } from '~/client/hooks/useLabels';
import { formatDate, formatTime } from '~/client/utils/time';

interface FormatDateProps {
    date: Date;
}

export function FormatDate({ date }: FormatDateProps) {
    const _ = useLabels();
    const ts = formatTime(date);
    const ds = formatDate(date);
    const [mon, day, year] = ds.split(' ', 3);
    const month = _(mon);

    return (
        <>
            {mon && (
                <time data-date>
                    {year ? (
                        <>
                            {year} {month.toLocaleLowerCase()}
                        </>
                    ) : (
                        month
                    )}
                    {day && <> {day}</>}
                </time>
            )}
            <time data-time>{ts}</time>
        </>
    );
}
