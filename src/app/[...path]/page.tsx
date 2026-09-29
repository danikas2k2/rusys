import { connection } from 'next/server';
import React from 'react';

import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import { NextApp } from '~/components/app/NextApp';
import { getInitialAppData } from '~/server/data/initialAppData';

export default async function AppPage({
    params,
}: {
    params?: Promise<{ path?: string[] }>;
} = {}): Promise<React.JSX.Element> {
    await connection();
    const clientId = process.env.GOOGLE_CLIENT_ID ?? (isDevMode() ? DEV_CLIENT_ID : undefined);
    const pathname = `/${(await params)?.path?.join('/') ?? ''}`;
    const initial = isDevMode() || clientId === DEV_CLIENT_ID ? await getInitialAppData(pathname) : undefined;
    return (
        <NextApp
            key={pathname}
            clientId={clientId}
            initialData={initial?.data}
            initialGroup={initial?.initialGroup}
            initialResource={initial?.resource}
        />
    );
}
