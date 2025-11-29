import { render, screen } from '@testing-library/react';

import React from 'react';

import { Toolbar } from '~/client/toolbar/Toolbar';

vi.mock('~/client/toolbar/ToolbarMenu', async () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
vi.mock('~/client/toolbar/ToolbarFilter', async () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
vi.mock('~/client/user/LogoutButton', async () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));

describe('<Toolbar>', () => {
    it('renders ToolbarFilter', () => {
        render(<Toolbar />);

        expect(screen.getByText('ToolbarFilter')).toBeInTheDocument();
    });

    it('renders ToolbarMenu', () => {
        render(<Toolbar />);

        expect(screen.getByText('ToolbarMenu')).toBeInTheDocument();
    });

    it('renders LogoutButton', () => {
        render(<Toolbar />);

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('renders passed children', () => {
        render(<Toolbar>children</Toolbar>);

        expect(screen.getByText('children')).toBeInTheDocument();
    });
});
