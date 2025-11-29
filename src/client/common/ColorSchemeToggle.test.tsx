import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useMantineColorScheme } from '@mantine/core';

import { ColorSchemeToggle } from '~/client/common/ColorSchemeToggle';

vi.mock('@mantine/core', async () => ({
    ...(await vi.importActual('@mantine/core')),
    useMantineColorScheme: vi.fn(),
}));

describe('<ColorSchemeToggle>', () => {
    const setColorScheme = vi.fn();

    beforeEach(() =>
        vi.mocked(useMantineColorScheme).mockReturnValue({
            colorScheme: 'light',
            setColorScheme,
            toggleColorScheme: vi.fn(),
            clearColorScheme: vi.fn(),
        })
    );

    afterEach(() => vi.clearAllMocks());

    it('renders with light scheme selected', () => {
        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        expect(screen.getByRole('radio', { name: 'Light mode' })).toBeChecked();
    });

    it('renders with dark scheme selected', () => {
        vi.mocked(useMantineColorScheme).mockReturnValue({
            colorScheme: 'dark',
            setColorScheme,
            toggleColorScheme: vi.fn(),
            clearColorScheme: vi.fn(),
        });

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        expect(screen.getByRole('radio', { name: 'Light mode' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Dark mode' })).toBeChecked();
    });

    it('renders with auto scheme selected', () => {
        vi.mocked(useMantineColorScheme).mockReturnValue({
            colorScheme: 'auto',
            setColorScheme,
            toggleColorScheme: vi.fn(),
            clearColorScheme: vi.fn(),
        });

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        expect(screen.getByRole('radio', { name: 'System preferred mode' })).toBeChecked();
    });

    it('changes to dark scheme when dark button is clicked', async () => {
        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        await user.click(screen.getByRole('radio', { name: 'Dark mode' }));

        await waitFor(() => expect(setColorScheme).toHaveBeenCalledWith('dark'));
    });

    it('changes to light scheme when light button is clicked', async () => {
        vi.mocked(useMantineColorScheme).mockReturnValue({
            colorScheme: 'dark',
            setColorScheme,
            toggleColorScheme: vi.fn(),
            clearColorScheme: vi.fn(),
        });

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        await user.click(screen.getByRole('radio', { name: 'Light mode' }));

        await waitFor(() => expect(setColorScheme).toHaveBeenCalledWith('light'));
    });

    it('changes to auto scheme when auto button is clicked', async () => {
        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        await user.click(screen.getByRole('radio', { name: 'System preferred mode' }));

        await waitFor(() => expect(setColorScheme).toHaveBeenCalledWith('auto'));
    });

    it('does not render auto button when auto prop is false', () => {
        render(
            <MockTheme>
                <ColorSchemeToggle auto={false} />
            </MockTheme>
        );

        expect(screen.queryByRole('radio', { name: 'System preferred mode' })).not.toBeInTheDocument();
    });
});
