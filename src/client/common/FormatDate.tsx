import React from 'react';

import { useLabels } from '~/client/hooks/useLabels';
import { formatDate, formatTime } from '~/client/utils/time';

export function FormatDate({ date }: { date: Date }) {
    const _ = useLabels();
    const ts = formatTime(date);
    const ds = formatDate(date);
    const [mon, day, year] = ds.split(' ', 3);
    const month = _(mon);
    return (
        <>
            {ds && (
                <time data-date>
                    {year ? (
                        <>
                            {year} {month.toLocaleLowerCase()}
                        </>
                    ) : (
                        month
                    )}
                    {day && <> {Number.parseInt(day, 10)}</>}
                </time>
            )}
            {ts && <time data-time>{ts}</time>}
        </>
    );
}
