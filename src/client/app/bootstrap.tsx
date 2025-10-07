import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { ColorSchemeState } from '@ui/ColorScheme';

import { App } from '~/client/app/App';
import { getStore } from '~/client/state/store';

import '@ui/theme.pcss';
import './bootstrap.pcss';

export function bootstrap(): void {
    const container = document.getElementById('root');
    if (!container) {
        // eslint-disable-next-line no-console
        console.error('No #root container found');
    } else {
        createRoot(container).render(
            <Provider store={getStore()}>
                <ColorSchemeState>
                    <App />
                </ColorSchemeState>
            </Provider>
        );
    }
}
