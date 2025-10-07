import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { ToolbarMenuItem } from '~/client/app/toolbar/ToolbarMenuItem';

describe('<ToolbarMenuItem>', () => {
    const onClick = jest.fn();
    const props = { onClick, icon: <div>TestIcon</div> };

    it('renders menu item with icon and text', () => {
        render(<ToolbarMenuItem {...props}>TestItem</ToolbarMenuItem>);

        expect(screen.getByRole('menuitem')).toBeInTheDocument();
        expect(screen.getByText('TestIcon')).toBeInTheDocument();
        expect(screen.getByText('TestItem')).toBeInTheDocument();
    });

    it('renders menu item with current state', () => {
        render(
            <ToolbarMenuItem {...props} current>
                TestItem
            </ToolbarMenuItem>
        );

        expect(screen.getByRole('menuitem')).toHaveClass('current');
    });

    it('handles click', async () => {
        render(<ToolbarMenuItem {...props}>TestItem</ToolbarMenuItem>);
        await userEvent.click(screen.getByRole('menuitem'));

        expect(onClick).toHaveBeenCalledWith(expect.event('click'));
    });
});
