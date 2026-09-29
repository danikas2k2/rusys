'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import React, { StrictMode, useState } from 'react';
import { Provider } from 'react-redux';

import { App } from '~/components/app/App';
import type { InitialAppData, InitialResource } from '~/components/app/initialData';
import { InitialGroupContext } from '~/components/app/InitialGroupContext';
import { InitialResourceContext } from '~/components/app/InitialResourceContext';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { LocaleContext } from '~/components/runtime/LocaleContext';
import type { Profile } from '~/store/profile/types';
import { getStore } from '~/store/store';
import { getTheme } from '~/styles/theme';

export function NextApp({
    clientId,
    profile,
    initialData,
    initialGroup,
    initialResource,
}: {
    clientId?: string;
    profile?: Profile;
    initialData?: InitialAppData;
    initialGroup?: string;
    initialResource?: InitialResource;
}): React.JSX.Element {
    const [store] = useState(() => getStore(clientId, initialData, profile));

    return (
        <StrictMode>
            <Provider store={store}>
                <MantineProvider theme={getTheme()} defaultColorScheme="auto" classNamesPrefix="ui">
                    <ErrorBoundary>
                        <LocaleContext value="lt-LT">
                            <DatesProvider settings={{ locale: 'lt' }}>
                                <InitialResourceContext value={initialResource}>
                                    <InitialGroupContext value={initialGroup}>
                                        <App />
                                    </InitialGroupContext>
                                </InitialResourceContext>
                            </DatesProvider>
                        </LocaleContext>
                    </ErrorBoundary>
                </MantineProvider>
            </Provider>
        </StrictMode>
    );
}
