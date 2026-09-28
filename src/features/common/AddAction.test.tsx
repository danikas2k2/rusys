import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { AddAction } from '~/features/common/AddAction';

describe('<AddAction>', () => {
    it('renders add button', () => {
        render(
            <MockThemeActive>
                <AddAction />
            </MockThemeActive>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls setActive with update action on click', async () => {
        const setActive = vi.fn();

        render(
            <MockThemeActive setActive={setActive}>
                <AddAction />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button'));

        expect(setActive).toHaveBeenCalledWith({ action: 'update' });
    });

    it('calls onClick callback when provided', async () => {
        const onClick = vi.fn();

        render(
            <MockThemeActive>
                <AddAction onClick={onClick} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('hides when active has action', () => {
        render(
            <MockThemeActive active={{ action: 'update' }}>
                <AddAction />
            </MockThemeActive>
        );

        expect(screen.getByRole('button')).toHaveAttribute('data-hidden', 'true');
    });

    it('hides when active has id', () => {
        render(
            <MockThemeActive active={{ id: 'test-id' }}>
                <AddAction />
            </MockThemeActive>
        );

        expect(screen.getByRole('button')).toHaveAttribute('data-hidden', 'true');
    });

    it('shows when active is undefined', () => {
        render(
            <MockThemeActive>
                <AddAction />
            </MockThemeActive>
        );

        expect(screen.getByRole('button')).not.toHaveAttribute('data-hidden', 'true');
    });
});
