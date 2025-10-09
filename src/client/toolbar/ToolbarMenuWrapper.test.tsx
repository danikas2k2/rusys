import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ToolbarMenuWrapper } from '~/client/toolbar/ToolbarMenuWrapper';

jest.mock('@ui/ColorSchemeToggle', () => ({
    ColorSchemeToggle: () => <div>ColorSchemeToggle</div>,
}));

describe('<ToolbarMenuWrapper>', () => {
    it('renders menu trigger only when is not clicked', async () => {
        render(
            <MockRedux>
                <ToolbarMenuWrapper>
                    <div>Content</div>
                </ToolbarMenuWrapper>
            </MockRedux>
        );

        expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders children and color scheme toggle when trigger is clicked', async () => {
        render(
            <MockRedux>
                <ToolbarMenuWrapper>
                    <div>Content</div>
                </ToolbarMenuWrapper>
            </MockRedux>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        const menu = screen.getByRole('menu');

        expect(menu).toBeInTheDocument();
        expect(within(menu).getByText('Content')).toBeInTheDocument();
        expect(within(menu).getByText('ColorSchemeToggle')).toBeInTheDocument();
    });
});
