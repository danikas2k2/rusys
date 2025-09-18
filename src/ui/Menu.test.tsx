import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { Menu } from '@ui/Menu';

describe('<Menu>', () => {
    it('renders trigger only while not clicked', async () => {
        render(<Menu trigger={<button>Open</button>}>Content</Menu>);

        expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders menu content when clicked on trigger', async () => {
        render(<Menu trigger={<button>Open</button>}>Content</Menu>);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        expect(screen.getByRole('menu')).toHaveTextContent('Content');
    });

    it('renders trigger only when clicked on trigger twice', async () => {
        render(<Menu trigger={<button>Open</button>}>Content</Menu>);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
