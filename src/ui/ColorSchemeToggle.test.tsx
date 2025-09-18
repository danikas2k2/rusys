import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { ColorSchemeToggle } from '@ui/ColorSchemeToggle';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';

jest.mock('@ui/hooks/useColorSchemeState');

describe('<ColorSchemeToggle>', () => {
    const setScheme = jest.fn();

    beforeEach(() => jest.mocked(useColorSchemeState).mockReturnValue(['light', setScheme]));

    afterEach(() => jest.clearAllMocks());

    it('renders with light scheme selected', () => {
        render(<ColorSchemeToggle />);

        expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders with dark scheme selected', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['dark', setScheme]);
        render(<ColorSchemeToggle />);

        expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders with auto scheme selected', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['auto', setScheme]);
        render(<ColorSchemeToggle />);

        expect(screen.getByRole('button', { name: 'System preferred mode' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('changes to dark scheme when dark button is clicked', async () => {
        render(<ColorSchemeToggle />);
        await userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

        expect(setScheme).toHaveBeenCalledWith('dark');
    });

    it('changes to light scheme when dark button is clicked', async () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['dark', setScheme]);
        render(<ColorSchemeToggle />);
        await userEvent.click(screen.getByRole('button', { name: 'Light mode' }));

        expect(setScheme).toHaveBeenCalledWith('light');
    });

    it('changes to auto scheme when auto button is clicked', async () => {
        render(<ColorSchemeToggle />);
        await userEvent.click(screen.getByRole('button', { name: 'System preferred mode' }));

        expect(setScheme).toHaveBeenCalledWith('auto');
    });

    it('does not render auto button when auto prop is false', () => {
        render(<ColorSchemeToggle auto={false} />);

        expect(screen.queryByRole('button', { name: 'System preferred mode' })).not.toBeInTheDocument();
    });

    it('renders with custom labels and icons', () => {
        render(
            <ColorSchemeToggle
                lightModeLabel="Light mode label"
                darkModeLabel="Dark mode label"
                autoModeLabel="Auto mode label"
                lightModeIcon={() => <div>Light mode icon</div>}
                darkModeIcon={() => <div>Dark mode icon</div>}
                autoModeIcon={() => <div>Auto mode icon</div>}
            />
        );

        expect(screen.getByRole('button', { name: 'Light mode label' })).toHaveTextContent('Light mode icon');
        expect(screen.getByRole('button', { name: 'Dark mode label' })).toHaveTextContent('Dark mode icon');
        expect(screen.getByRole('button', { name: 'Auto mode label' })).toHaveTextContent('Auto mode icon');
    });
});
