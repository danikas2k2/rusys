import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';
import { renderToString } from 'react-dom/server';

import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';
import { NextApp } from './NextApp';

vi.mock(import('~/components/app/App'), () => ({
    App: () => {
        const locale = use(LocaleContext);
        const setLocale = use(SetLocaleContext);
        return (
            <main>
                Inventory app <span>{locale}</span>
                <button onClick={() => setLocale('lt-LT')}>Lithuanian</button>
            </main>
        );
    },
}));

describe('<NextApp>', () => {
    it('mounts the application inside its providers', async () => {
        render(<NextApp />);

        await expect(screen.findByText('Inventory app')).resolves.toBeInTheDocument();
    });

    it('renders application HTML on the server', () => {
        expect(renderToString(<NextApp clientId="test-client-id" />)).toContain('Inventory app');
    });

    it('updates the active locale without remounting the app', async () => {
        render(<NextApp locale="en-US" />);

        expect(screen.getByText('en-US')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Lithuanian' }));

        expect(screen.getByText('lt-LT')).toBeInTheDocument();
    });
});
