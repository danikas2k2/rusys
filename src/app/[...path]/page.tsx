import { createHash } from 'node:crypto';

import { connection } from 'next/server';
import React from 'react';

import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import { NextApp } from '~/components/app/NextApp';
import { getSessionProfile } from '~/server/auth/session';
import { getInitialAppData } from '~/server/data/initialAppData';
import { getRequestLocale } from '~/server/requestLocale';

export default async function AppPage({
    params,
}: {
    params?: Promise<{ path?: string[] }>;
} = {}): Promise<React.JSX.Element> {
    await connection();
    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    const pathname = `/${(await params)?.path?.join('/') ?? ''}`;
    const profile = await getSessionProfile();
    const initial = profile ? await getInitialAppData(pathname) : undefined;
    const dataVersion = createHash('sha256')
        .update(JSON.stringify(initial?.data ?? {}))
        .digest('hex');
    const locale = await getRequestLocale();
    return (
        <NextApp
            key={`${pathname}:${profile?.sub ?? 'guest'}:${dataVersion}`}
            clientId={clientId}
            profile={profile}
            initialData={initial?.data}
            initialGroup={initial?.initialGroup}
            initialResource={initial?.resource}
            locale={locale}
        />
    );
}
