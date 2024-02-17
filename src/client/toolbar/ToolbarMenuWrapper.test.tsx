import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToolbarMenuWrapper } from '~/client/toolbar/ToolbarMenuWrapper';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('@ui/ColorSchemeToggler', () => () => <div>ColorSchemeToggler</div>);

describe('ToolbarMenuWrapper', () => {
    it('renders menu trigger only when is not clicked', async () => {
        render(
            <ToolbarMenuWrapper>
                <div>Content</div>
            </ToolbarMenuWrapper>,
            withReduxState()
        );
        expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders children and color scheme toggler when trigger is clicked', async () => {
        render(
            <ToolbarMenuWrapper>
                <div>Content</div>
            </ToolbarMenuWrapper>,
            withReduxState()
        );
        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        expect(within(menu).getByText('Content')).toBeInTheDocument();
        expect(within(menu).getByText('ColorSchemeToggler')).toBeInTheDocument();
    });
});
