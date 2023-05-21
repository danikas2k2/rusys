import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from '~/client/App';
import store from '~/store';
import './index.less';

const container = document.getElementById('root');
if (!container) {
    // eslint-disable-next-line no-console
    console.error('No #root container found');
} else {
    createRoot(container).render(
        <Provider store={store}>
            <App />
        </Provider>
    );
}
