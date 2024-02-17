import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeToggler } from '@ui/ColorSchemeToggler';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import React from 'react';

jest.mock('@ui/hooks/useColorSchemeState');

describe('ColorSchemeToggler', () => {
    const setScheme = jest.fn();

    beforeEach(() => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['light', setScheme]);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders with light scheme selected', () => {
        render(<ColorSchemeToggler />);
        expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('changes to dark scheme when dark button is clicked', async () => {
        render(<ColorSchemeToggler />);
        await userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
        expect(setScheme).toHaveBeenCalledWith('dark');
    });

    it('changes to auto scheme when auto button is clicked', async () => {
        render(<ColorSchemeToggler />);
        await userEvent.click(screen.getByRole('button', { name: 'System preferred mode' }));
        expect(setScheme).toHaveBeenCalledWith('auto');
    });

    it('does not render auto button when auto prop is false', () => {
        render(<ColorSchemeToggler auto={false} />);
        expect(screen.queryByRole('button', { name: 'System preferred mode' })).not.toBeInTheDocument();
    });
});
