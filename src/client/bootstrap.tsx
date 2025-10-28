import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { MantineProvider } from '@mantine/core';

import { App } from '~/client/App';
import { getStore } from '~/client/state/store';

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@ui/theme.pcss';
import './bootstrap.pcss';

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
                    /*
                    classNamesPrefix = 'mantine',
                    cssVariablesResolver,
                    cssVariablesSelector = ':root',
                    deduplicateCssVariables = true,
                    getStyleNonce,
                    stylesTransform,
                    withCssVariables = true,
                    withGlobalClasses = true,
                    withStaticClasses = true,

                    // TODO: use Mantine color scheme manager instead of custom
                    colorSchemeManager = localStorageColorSchemeManager(),
                    forceColorScheme,

                    // TODO: check what for this env used
                    env,
                    getRootElement = () => document.documentElement,
                  */
                >
                    <App />
                </MantineProvider>
            </Provider>
        );
    }
}
