'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import React, { StrictMode, useState } from 'react';
import { Provider } from 'react-redux';

import { App } from '~/components/app/App';
import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { InitialGroupContext } from '~/components/app/InitialGroupContext';
import { InitialResourceContext } from '~/components/app/InitialResourceContext';
import { ServiceWorkerIdentity } from '~/components/app/ServiceWorker/Identity';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';
import { DEFAULT_LOCALE, type AppLocale } from '~/lib/locale';
import type { Profile } from '~/store/profile';
import { getStore } from '~/store/store';
import { getTheme } from '~/styles/theme';

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
    const [store] = useState(() => getStore(clientId, initialData, profile));
    const [activeLocale, setActiveLocale] = useState<AppLocale>(locale);

    return (
        <StrictMode>
            <ServiceWorkerIdentity sub={profile?.sub} />
            <Provider store={store}>
                <MantineProvider theme={getTheme()} defaultColorScheme="auto" classNamesPrefix="ui">
                    <ErrorBoundary>
                        <SetLocaleContext value={setActiveLocale}>
                            <LocaleContext value={activeLocale}>
                                <DatesProvider settings={{ locale: activeLocale === 'lt-LT' ? 'lt' : 'en' }}>
                                    <InitialResourceContext value={initialResource}>
                                        <InitialGroupContext value={initialGroup}>
                                            <App />
                                        </InitialGroupContext>
                                    </InitialResourceContext>
                                </DatesProvider>
                            </LocaleContext>
                        </SetLocaleContext>
                    </ErrorBoundary>
                </MantineProvider>
            </Provider>
        </StrictMode>
    );
}
