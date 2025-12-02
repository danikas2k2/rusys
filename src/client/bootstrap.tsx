import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { MantineProvider } from '@mantine/core';

import { App } from '~/client/App';
import { getStore } from '~/client/state/store';
import { getTheme } from '~/client/theme';

export function bootstrap(): void {
    const container = document.getElementById('root');
    if (!container) {
        // eslint-disable-next-line no-console
        console.error('No #root container found');
    } else {
        createRoot(container).render(
            <Provider store={getStore()}>
                <MantineProvider
                    theme={getTheme()}
                    defaultColorScheme="auto"
                    classNamesPrefix="ui"
                    /*
                    cssVariablesSelector = ':root',
                    withCssVariables = true,
                    deduplicateCssVariables = true,
                    withGlobalClasses = true,
                    withStaticClasses = true,
                    getRootElement = () => document.documentElement,
                  */
                >
                    <App />
                </MantineProvider>
            </Provider>
        );
    }
}
