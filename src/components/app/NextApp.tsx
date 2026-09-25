'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import React, { StrictMode, Suspense, use, useState } from 'react';
import { browser } from 'react-dom';
import { Provider } from 'react-redux';

import { App } from '~/components/app/App';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { LocaleContext } from '~/components/runtime/LocaleContext';
import { getStore } from '~/store/store';
import { getTheme } from '~/styles/theme';

export function NextApp(): React.JSX.Element {
    return (
        <Suspense fallback={null}>
            <BrowserApp />
        </Suspense>
    );
}

function BrowserApp(): React.JSX.Element {
    use(browser());
    const [store] = useState(getStore);

    return (
        <StrictMode>
            <Provider store={store}>
                <MantineProvider theme={getTheme()} defaultColorScheme="auto" classNamesPrefix="ui">
                    <ErrorBoundary>
                        <LocaleContext value="lt-LT">
                            <DatesProvider settings={{ locale: 'lt' }}>
                                <App />
                            </DatesProvider>
                        </LocaleContext>
                    </ErrorBoundary>
                </MantineProvider>
            </Provider>
        </StrictMode>
    );
}
