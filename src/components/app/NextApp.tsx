'use client';

import { localStorageColorSchemeManager, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import React, { StrictMode, useState } from 'react';

import { App } from '~/components/app/App';
import { IdentityProvider } from '~/components/app/IdentityContext';
import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { InitialGroupContext } from '~/components/app/InitialGroupContext';
import { InitialResourceContext } from '~/components/app/InitialResourceContext';
import { ServiceWorkerIdentity } from '~/components/app/ServiceWorker/Identity';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';
import { DEFAULT_LOCALE, type AppLocale } from '~/lib/locale';
import { messagesForLocale } from '~/lib/messages';
import { setCatalogData } from '~/store/catalog';
import type { Profile } from '~/store/profile';
import { getTheme } from '~/styles/theme';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'mantine-color-scheme-value' });

export function NextApp({
    clientId,
    profile,
    initialData,
    initialGroup,
    initialResource,
    locale = DEFAULT_LOCALE,
}: {
    clientId?: string;
    profile?: Profile;
    initialData?: InitialAppData;
    initialGroup?: string;
    initialResource?: InitialResource;
    locale?: AppLocale;
}): React.JSX.Element {
    const [queryClient] = useState(() => {
        const client = new QueryClient({
            defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false } },
        });
        if (initialData) {
            setCatalogData(client, initialData);
        }
        return client;
    });
    const [activeLocale, setActiveLocale] = useState<AppLocale>(locale);

    return (
        <StrictMode>
            <ServiceWorkerIdentity sub={profile?.sub} />
            <QueryClientProvider client={queryClient}>
                <IdentityProvider clientId={clientId} initialProfile={profile}>
                    <MantineProvider
                        theme={getTheme()}
                        defaultColorScheme="auto"
                        colorSchemeManager={colorSchemeManager}
                        classNamesPrefix="ui"
                    >
                        <ErrorBoundary>
                            <SetLocaleContext value={setActiveLocale}>
                                <LocaleContext value={activeLocale}>
                                    <NextIntlClientProvider
                                        locale={activeLocale}
                                        messages={messagesForLocale(activeLocale)}
                                    >
                                        <DatesProvider settings={{ locale: activeLocale === 'lt-LT' ? 'lt' : 'en' }}>
                                            <InitialResourceContext value={initialResource}>
                                                <InitialGroupContext value={initialGroup}>
                                                    <App />
                                                </InitialGroupContext>
                                            </InitialResourceContext>
                                        </DatesProvider>
                                    </NextIntlClientProvider>
                                </LocaleContext>
                            </SetLocaleContext>
                        </ErrorBoundary>
                    </MantineProvider>
                </IdentityProvider>
            </QueryClientProvider>
        </StrictMode>
    );
}
