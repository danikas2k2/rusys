import { ColorSchemeState } from '@ui/ColorScheme';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from '~/client/App';
import { getStore } from '~/state/store';
import './bootstrap.less';

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
