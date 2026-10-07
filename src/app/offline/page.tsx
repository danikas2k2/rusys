import type { Metadata } from 'next';
import React from 'react';

import { translate } from '~/lib/translate';
import { getRequestLocale } from '~/server/requestLocale';
import { OfflineContent } from './OfflineContent';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    return { title: `${translate('No connection', locale)} · ${translate('Cellar', locale)}` };
}

export default async function OfflinePage(): Promise<React.JSX.Element> {
    const locale = await getRequestLocale();
    return <OfflineContent locale={locale} />;
}
