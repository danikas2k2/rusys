import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { MantineProvider } from '@mantine/core';

import { App } from '~/client/App';
import { ErrorBoundary } from '~/client/common/ErrorBoundary';
import { LocaleContext } from '~/client/common/LocaleContext';
import { getStore } from '~/client/state/store';
import { getTheme } from '~/client/theme';

export function bootstrap(): void {
    const container = document.getElementById('root');
    if (!container) {
        // eslint-disable-next-line no-console
        console.error('No #root container found');
        return;
    }

    createRoot(container, {
        onCaughtError: (error, errorInfo) => {
            // eslint-disable-next-line no-console
            console.warn(`[ERR] Caught error in React tree: ${error}`, errorInfo);
        },
        onUncaughtError: (error, errorInfo) => {
            // eslint-disable-next-line no-console
            console.error(`[ERR] Uncaught error in React tree: ${error}`, errorInfo);
        },
    }).render(
        <StrictMode>
            <Provider store={getStore()}>
                <MantineProvider
                    theme={getTheme()}
                    defaultColorScheme="auto"
                    classNamesPrefix="ui"
                    /*
                    withCssVariables = true,
                    deduplicateCssVariables = true,
                    withGlobalClasses = true,
                    withStaticClasses = true,
                    */
                >
                    <ErrorBoundary>
                        <LocaleContext value={process.env.LOCALE}>
                            <App />
                        </LocaleContext>
                    </ErrorBoundary>
                </MantineProvider>
            </Provider>
        </StrictMode>
    );
}
