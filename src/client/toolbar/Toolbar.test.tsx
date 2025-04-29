import React from 'react';
import { render, screen } from '@testing-library/react';
import { Toolbar } from '~/client/toolbar/Toolbar';

jest.mock('~/client/toolbar/ToolbarMenu', () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
jest.mock('~/client/toolbar/ToolbarFilter', () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
jest.mock('~/client/user/LogoutButton', () => ({
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
