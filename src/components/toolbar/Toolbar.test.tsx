import { render, screen } from '@testing-library/react';

import React from 'react';

import { Toolbar } from '~/components/toolbar/Toolbar';

vi.mock(import('~/components/toolbar/ToolbarMenu'), () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
vi.mock(import('~/components/toolbar/ToolbarFilter'), () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
vi.mock(import('~/components/user/LogoutButton'), () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));
vi.mock(import('~/components/toolbar/ToolbarReviewButton'), () => ({
    ToolbarReviewButton: () => <div>ToolbarReviewButton</div>,
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

    it('renders ToolbarReviewButton', () => {
        render(<Toolbar />);

        expect(screen.getByText('ToolbarReviewButton')).toBeInTheDocument();
    });

    it('renders passed children', () => {
        render(<Toolbar>children</Toolbar>);

        expect(screen.getByText('children')).toBeInTheDocument();
    });
});
