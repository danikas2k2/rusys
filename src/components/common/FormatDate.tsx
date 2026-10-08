import React from 'react';

import { useLabels } from '~/lib/hooks/useLabels';
import { useLocale } from '~/lib/hooks/useLocale';
import { formatDate, formatTime } from '~/lib/utils/time';

export function FormatDate({ date }: { date: Date }) {
    const _ = useLabels();
    const locale = useLocale();
    const ts = formatTime(date, locale);
    const ds = formatDate(date, locale, _);
    return (
        <>
            {ds && <time data-date>{ds}</time>}
            {ts && <time data-time>{ts}</time>}
        </>
    );
}
