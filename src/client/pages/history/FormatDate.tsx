import React from 'react';

import { Label } from '~/client/common/Label';
import { formatDate, formatTime } from '~/client/utils/time';

interface FormatDateProps {
    date: Date;
}

export function FormatDate({ date }: FormatDateProps) {
    const ts = formatTime(date);
    const ds = formatDate(date);
    const [mon, day] = ds.split(' ', 2);
    return (
        <>
            {mon && (
                <time data-date>
                    <Label>{mon}</Label> {day}
                </time>
            )}
            <time data-time>{ts}</time>
        </>
    );
}
