import { render, screen } from '@testing-library/react';

import React from 'react';

import { Toolbar } from '~/client/app/toolbar/Toolbar';

jest.mock('~/client/app/toolbar/ToolbarMenu', () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
jest.mock('~/client/app/toolbar/ToolbarFilter', () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
jest.mock('~/client/app/user/LogoutButton', () => ({
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
