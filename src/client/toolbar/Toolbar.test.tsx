import { render, screen } from '@testing-library/react';

import React from 'react';

import { Toolbar } from '~/client/toolbar/Toolbar';

vi.mock(import('~/client/toolbar/ToolbarMenu'), () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
vi.mock(import('~/client/toolbar/ToolbarFilter'), () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
vi.mock(import('~/client/user/LogoutButton'), () => ({
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
