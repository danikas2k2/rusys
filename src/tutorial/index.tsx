import React from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSchemeState } from '@ui/ColorScheme';
import { Tutorial } from '~/tutorial/Tutorial';
import './index.less';

const container = document.getElementById('root');
if (!container) {
    // eslint-disable-next-line no-console
    console.error('No #root container found');
} else {
    createRoot(container).render(
        <ColorSchemeState>
            <Tutorial />
        </ColorSchemeState>
    );
}
