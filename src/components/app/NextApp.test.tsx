import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import { useMantineColorScheme } from '@mantine/core';
import React, { use } from 'react';
import { renderToString } from 'react-dom/server';

import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';
import { NextApp } from './NextApp';

vi.mock(import('~/components/app/App'), () => ({
    App: () => {
        const locale = use(LocaleContext);
        const setLocale = use(SetLocaleContext);
        const { colorScheme, setColorScheme } = useMantineColorScheme();
        return (
            <main>
                Inventory app <span>{locale}</span>
                <button onClick={() => setLocale('lt-LT')}>Lithuanian</button>
                <button onClick={() => setColorScheme('light')}>Light theme</button>
                <output data-testid="color-scheme">{colorScheme}</output>
            </main>
        );
    },
}));

describe('<NextApp>', () => {
    afterEach(() => window.localStorage.clear());

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

    it('restores and persists the Mantine color scheme without rendering a client script', async () => {
        window.localStorage.setItem('mantine-color-scheme-value', 'dark');
        const { container, unmount } = render(<NextApp />);

        expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
        expect(container.querySelector('script')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Light theme' }));

        expect(window.localStorage.getItem('mantine-color-scheme-value')).toBe('light');

        unmount();
        render(<NextApp />);

        expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
    });
});
