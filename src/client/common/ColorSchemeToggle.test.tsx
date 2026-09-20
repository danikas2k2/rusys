import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import React from 'react';

import { ColorSchemeToggle } from '~/client/common/ColorSchemeToggle';

vi.mock(import('@mantine/core'), async () => ({
    ...(await vi.importActual('@mantine/core')),
    useComputedColorScheme: vi.fn(),
    useMantineColorScheme: vi.fn(),
}));

describe('<ColorSchemeToggle>', () => {
    const clearColorScheme = vi.fn();
    const setColorScheme = vi.fn();

    const mockSchemes = (colorScheme: 'auto' | 'light' | 'dark', systemScheme: 'light' | 'dark') => {
        vi.mocked(useMantineColorScheme).mockReturnValue({
            colorScheme,
            clearColorScheme,
            setColorScheme,
            toggleColorScheme: vi.fn(),
        });
        vi.mocked(useComputedColorScheme).mockReturnValue(systemScheme);
    };

    beforeEach(() => mockSchemes('auto', 'light'));

    afterEach(() => vi.clearAllMocks());

    it('shows the sun on the left and enables dark mode from a light system theme', async () => {
        const { container } = render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        const toggle = screen.getByRole('switch', { name: 'Dark mode' });

        expect(toggle).not.toBeChecked();
        expect(container.querySelector('.tabler-icon-sun')).toBeInTheDocument();

        await user.click(toggle);

        expect(setColorScheme).toHaveBeenCalledWith('dark');
        expect(clearColorScheme).not.toHaveBeenCalled();
    });

    it('shows the moon on the right and enables light mode from dark mode', async () => {
        mockSchemes('dark', 'light');

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        const toggle = screen.getByRole('switch', { name: 'Light mode' });

        expect(toggle).toBeChecked();
        expect(screen.getByRole('switch').parentElement?.querySelector('.tabler-icon-moon')).toBeInTheDocument();

        await user.click(toggle);

        expect(setColorScheme).toHaveBeenCalledWith('light');
        expect(clearColorScheme).not.toHaveBeenCalled();
    });

    it('shows light mode and enables it when the system theme is dark', async () => {
        mockSchemes('auto', 'dark');

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        await user.click(screen.getByRole('switch', { name: 'Light mode' }));

        expect(setColorScheme).toHaveBeenCalledWith('light');
    });

    it('enables dark mode from forced light mode', async () => {
        mockSchemes('light', 'dark');

        render(
            <MockTheme>
                <ColorSchemeToggle />
            </MockTheme>
        );

        await user.click(screen.getByRole('switch', { name: 'Dark mode' }));

        expect(setColorScheme).toHaveBeenCalledWith('dark');
    });
});
